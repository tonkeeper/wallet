import Foundation
import TonMnemonicSwift
import LocalAuthentication

@objc(WalletStore)
@objcMembers
class WalletStore: NSObject {
  
  private let userDefaultsService = UserDefaultsService()
  private let keychainService = KeychainService()
  
  static func requiresMainQueueSetup() -> Bool { false }
  
  // MARK: - Public methods
  
  func listWallets(_ resolve: @escaping RCTPromiseResolveBlock,
                   reject: @escaping RCTPromiseRejectBlock) {
    let wallets = userDefaultsService.wallets
    if wallets.count > 0 {
      resolve(wallets.map({ $0.toDict() }))
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func validate(_ words: [String],
                resolve: @escaping RCTPromiseResolveBlock,
                reject: @escaping RCTPromiseRejectBlock) {
    let isValid = Mnemonic.mnemonicValidate(mnemonicArray: words, password: "")
    resolve(isValid)
  }
  
  func importWalletWithPasscode(_ words: [String],
                                passcode: String,
                                resolve: @escaping RCTPromiseResolveBlock,
                                reject: @escaping RCTPromiseRejectBlock) {
    do {
      let keyPair = try getKeyPair(words: words)
      let pubkey = keyPair.publicKey.hexString()
      
      let context = LAContext()
      context.setCredential(Data(passcode.utf8), type: .applicationPassword)
      try keychainService.set(words.joined(separator: " "), forKey: "\(pubkey)-password", context: context, accessControl: .password)
      
      let walletInfo = WalletInfo(pubkey: pubkey, label: "")
      userDefaultsService.wallets.insert(walletInfo)
      
      resolve(walletInfo.toDict())
      
    } catch {
      let rejectBlock = self.rejectBlock(error: error, code: 400)
      reject(rejectBlock.0, rejectBlock.1, rejectBlock.2)
    }
  }
  
  func importWalletWithBiometry(_ words: [String],
                                resolve: @escaping RCTPromiseResolveBlock,
                                reject: @escaping RCTPromiseRejectBlock) {
    do {
      let keyPair = try getKeyPair(words: words)
      let pubkey = keyPair.publicKey.hexString()
      
      try keychainService.set(words.joined(separator: " "), forKey: "\(pubkey)-biometry", accessControl: .biometry)
      
      let walletInfo = WalletInfo(pubkey: pubkey, label: "")
      userDefaultsService.wallets.insert(walletInfo)
      
      resolve(walletInfo.toDict())
      
    } catch {
      let rejectBlock = self.rejectBlock(error: error, code: 400)
      reject(rejectBlock.0, rejectBlock.1, rejectBlock.2)
    }
  }
  
  func getWallet(_ pk: String,
                 resolve: @escaping RCTPromiseResolveBlock,
                 reject: @escaping RCTPromiseRejectBlock) {
    if let wallet = userDefaultsService.wallets.first(where: { $0.pubkey == pk }) {
      resolve(wallet.toDict())
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func getWalletByAddress(_ address: String,
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    if let wallet = userDefaultsService.wallets.first(where: {$0.pubkey == address }) {
      resolve(wallet.toDict())
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func updateWallet(_ pk: String, label: String,
                    resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock) {
    if let index = userDefaultsService.wallets.firstIndex(where: { $0.pubkey == pk }) {
      let wallet = userDefaultsService.wallets[index]
      wallet.label = label
      userDefaultsService.wallets[index] = wallet
      resolve(true)
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func currentWalletInfo(_ resolve: @escaping RCTPromiseResolveBlock,
                         reject: @escaping RCTPromiseRejectBlock) {
    if let currentWalletInfo = userDefaultsService.currentWalletInfo {
      resolve(currentWalletInfo.toDict())
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func setCurrentWallet(_ pk: String,
                        resolve: @escaping RCTPromiseResolveBlock,
                        reject: @escaping RCTPromiseRejectBlock) {
    if let wallet = userDefaultsService.wallets.first(where: { $0.pubkey == pk }) {
      userDefaultsService.currentWalletInfo = wallet
      resolve(true)
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func exportWithPasscode(_ pk: PublicKey,
                          passcode: String,
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    do {
      let mnemonicArray = try loadMnemonicWithPasscode(pk: pk, passcode: passcode)
      let keyPair = try Mnemonic.mnemonicToPrivateKey(mnemonicArray: mnemonicArray, password: "")
      resolve(keyPair.secretKey.hexString())
      
    } catch {
      let rejectBlock = self.rejectBlock(error: error, code: 400)
      reject(rejectBlock.0, rejectBlock.1, rejectBlock.2)
    }
  }
  
  func exportWithBiometry(_ pk: PublicKey,
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    loadMnemonicWithBiometry(pk: pk) { result in
      var rejectError: Error?
      switch result {
      case .success(let mnemonicArray):
        do {
          let keyPair = try Mnemonic.mnemonicToPrivateKey(mnemonicArray: mnemonicArray, password: "")
          resolve(keyPair.secretKey.hexString())
        } catch {
          rejectError = error
        }
        
      case .failure(let error):
        rejectError = error
      }
      
      if let error = rejectError {
        let rejectBlock = self.rejectBlock(error: error, code: 400)
        reject(rejectBlock.0, rejectBlock.1, rejectBlock.2)
      }
    }
  }
  
  func backupWithPasscode(_ pk: PublicKey,
                          passcode: String,
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    do {
      let mnemonicArray = try loadMnemonicWithPasscode(pk: pk, passcode: passcode)
      resolve(mnemonicArray)
      
    } catch {
      let rejectBlock = self.rejectBlock(error: error, code: 400)
      reject(rejectBlock.0, rejectBlock.1, rejectBlock.2)
    }
  }
  
  func backupWithBiometry(_ pk: PublicKey,
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    loadMnemonicWithBiometry(pk: pk) { result in
      switch result {
      case .success(let mnemonicArray): resolve(mnemonicArray)
      case .failure(let error):
        let rejectBlock = self.rejectBlock(error: error, code: 400)
        reject(rejectBlock.0, rejectBlock.1, rejectBlock.2)
      }
    }
  }
  
  // MARK: - Private methods
  
  private func getKeyPair(words: [String]) throws -> KeyPair {
    guard Mnemonic.mnemonicValidate(mnemonicArray: words, password: "") else {
      throw WalletError.invalidMnemonic
    }
    
    let keyPair = try Mnemonic.mnemonicToPrivateKey(mnemonicArray: words, password: "")
    
    return keyPair
  }
  
  private func loadMnemonicWithPasscode(pk: PublicKey, passcode: String) throws -> [String] {
    let context = LAContext()
    context.setCredential(Data(passcode.utf8), type: .applicationPassword)
    let mnemonic = try keychainService.string(forKey: "\(pk)-password",
                                              context: context,
                                              accessControl: .password)
    return mnemonic.components(separatedBy: " ")
  }
  
  private func loadMnemonicWithBiometry(pk: PublicKey, completion: @escaping (Result<[String], Error>) -> Void) {
    if let accessControl = AccessControl.biometry.rawValue(accessibility: keychainService.accessibility) {
      let biometryContext = LAContext()
      biometryContext.evaluateAccessControl(accessControl,
                                            operation: .useItem,
                                            localizedReason: "Need localized") { success, error in
        if success {
          do {
            let mnemonic = try self.keychainService.string(forKey: "\(pk)-biometry",
                                                           context: biometryContext,
                                                           accessControl: .biometry)
            completion(.success(mnemonic.components(separatedBy: " ")))
          } catch {
            completion(.failure(error))
          }
        } else if let error = error {
          completion(.failure(error))
        }
      }
    }
  }
  
  private func rejectBlock(error: Error, code: Int) -> (String?, String, NSError) {
    let foundationError = NSError(domain: Constants.bundleIdentifier, code: code)
    if let error = error as? TweetNaclError {
      return (error.errorDescription, error.localizedDescription, foundationError)
    } else if let error = error as? KeychainServiceError {
      return ("\(error.code)", error.localizedDescription, foundationError)
    } else {
      return (nil, error.localizedDescription, foundationError)
    }
  }
  
}
