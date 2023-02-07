import Foundation
import TonMnemonicSwift
import LocalAuthentication

@objc(WalletStore)
@objcMembers
final class WalletStore: NSObject {
  
  @Autowired private var userDefaultsService: UserDefaultsService?
  @Autowired private var keychainService: KeychainService?
  @Autowired private var uiService: UIService?
  
  static func requiresMainQueueSetup() -> Bool { false }
  
  // MARK: - Public methods
  
  func listWallets(_ resolve: @escaping RCTPromiseResolveBlock,
                   reject: @escaping RCTPromiseRejectBlock) {
    if let wallets = userDefaultsService?.wallets, wallets.count > 0 {
      resolve(wallets.map({ $0.toDict() }))
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func removeWallets(_ resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock) {
    
    if let wallets = userDefaultsService?.wallets, wallets.count > 0 {
      userDefaultsService?.wallets.forEach {
        removeWallet($0.pubkey, resolve: resolve, reject: reject)
      }
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
    if !passcode.isEmpty {
      importWithPasscode(words, passcode: passcode, resolve: resolve, reject: reject)
    } else {
      validatePasscode { [weak self] passcode in
        self?.importWithPasscode(words, passcode: passcode ?? "", resolve: resolve, reject: reject)
      }
    }
  }
  
  func importWalletWithBiometry(_ words: [String],
                                resolve: @escaping RCTPromiseResolveBlock,
                                reject: @escaping RCTPromiseRejectBlock) {
    do {
      let keyPair = try getKeyPair(words: words)
      let pubkey = keyPair.publicKey.hexString()
      
      userDefaultsService?.isBiometryEnabled = true
      try keychainService?.set(words.joined(separator: " "), forKey: "\(pubkey)-biometry", accessControl: .biometry)
      
      let walletInfo = WalletInfo(pubkey: pubkey, label: "")
      insertWallet(walletInfo)
      
      resolve(walletInfo.toDict())
      
    } catch {
      let rejectBlock = self.rejectBlock(error: error, code: 400)
      reject(rejectBlock.0, rejectBlock.1, rejectBlock.2)
    }
  }
  
  func getWallet(_ pk: String,
                 resolve: @escaping RCTPromiseResolveBlock,
                 reject: @escaping RCTPromiseRejectBlock) {
    if let wallet = userDefaultsService?.wallets.first(where: { $0.pubkey == pk }) {
      resolve(wallet.toDict())
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func getWalletByAddress(_ address: String,
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    if let wallet = userDefaultsService?.wallets.first(where: {$0.pubkey == address }) {
      resolve(wallet.toDict())
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func updateWallet(_ pk: String, label: String,
                    resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock) {
    if let index = userDefaultsService?.wallets.firstIndex(where: { $0.pubkey == pk }),
       let wallet = userDefaultsService?.wallets[index] {
      wallet.label = label
      userDefaultsService?.wallets[index] = wallet
      resolve(true)
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func removeWallet(_ pk: String,
                    resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock) {
    if let index = userDefaultsService?.wallets.firstIndex(where: { $0.pubkey == pk }) {
      do {
        try keychainService?.deleteItem(forKey: pk + "-password")
        try keychainService?.deleteItem(forKey: pk + "-biometry")
      } catch {
        let rejectBlock = self.rejectBlock(error: error, code: 400)
        reject(rejectBlock.0, rejectBlock.1, rejectBlock.2)
      }
      
      userDefaultsService?.wallets.remove(at: index)
      resolve(true)
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func currentWalletInfo(_ resolve: @escaping RCTPromiseResolveBlock,
                         reject: @escaping RCTPromiseRejectBlock) {
    if let pk = userDefaultsService?.currentWalletPubkey,
       let wallet = userDefaultsService?.wallets.first(where: { $0.pubkey == pk }) {
      resolve(wallet.toDict())
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func setCurrentWallet(_ pk: String,
                        resolve: @escaping RCTPromiseResolveBlock,
                        reject: @escaping RCTPromiseRejectBlock) {
    if userDefaultsService?.wallets.contains(where: { $0.pubkey == pk }) == true {
      userDefaultsService?.currentWalletPubkey = pk
      resolve(true)
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func exportKey(_ pk: PublicKey,
                 resolve: @escaping RCTPromiseResolveBlock,
                 reject: @escaping RCTPromiseRejectBlock) {
    if let isBiometryEnabled = userDefaultsService?.isBiometryEnabled, isBiometryEnabled {
      loadKeyPairWithBiometry(pk: pk) { [weak self] result in
        switch result {
        case .success(let keyPair):
          resolve(keyPair.secretKey.hexString())
          
        case .failure:
          self?.validatePasscode { passcode in
            self?.exportWithPasscode(pk, passcode: passcode ?? "", resolve: resolve, reject: reject)
          }
        }
      }
    } else {
      validatePasscode { [weak self] passcode in
        self?.exportWithPasscode(pk, passcode: passcode ?? "", resolve: resolve, reject: reject)
      }
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
    loadKeyPairWithBiometry(pk: pk) { result in
      switch result {
      case .success(let keyPair):
        resolve(keyPair.secretKey.hexString())
        
      case .failure(let error):
        let rejectBlock = self.rejectBlock(error: error, code: 400)
        reject(rejectBlock.0, rejectBlock.1, rejectBlock.2)
      }
    }
  }
  
  func backup(_ pk: PublicKey,
              resolve: @escaping RCTPromiseResolveBlock,
              reject: @escaping RCTPromiseRejectBlock) {
    if let isBiometryEnabled = userDefaultsService?.isBiometryEnabled, isBiometryEnabled {
      loadMnemonicWithBiometry(pk: pk) { [weak self] result in
        switch result {
        case .success(let mnemonicArray): resolve(mnemonicArray)
        case .failure:
          self?.validatePasscode { passcode in
            self?.backupWithPasscode(pk, passcode: passcode ?? "", resolve: resolve, reject: reject)
          }
        }
      }
    } else {
      validatePasscode { [weak self] passcode in
        self?.backupWithPasscode(pk, passcode: passcode ?? "", resolve: resolve, reject: reject)
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
  
  private func importWithPasscode(_ words: [String],
                                  passcode: String,
                                  resolve: @escaping RCTPromiseResolveBlock,
                                  reject: @escaping RCTPromiseRejectBlock) {
    do {
      let keyPair = try getKeyPair(words: words)
      let pubkey = keyPair.publicKey.hexString()
      
      let context = LAContext()
      context.setCredential(Data(passcode.utf8), type: .applicationPassword)
      try keychainService?.set(passcode, forKey: KeychainService.passcodeKeyPath)
      try keychainService?.set(words.joined(separator: " "), forKey: "\(pubkey)-password", context: context, accessControl: .password)
      
      let walletInfo = WalletInfo(pubkey: pubkey, label: "")
      insertWallet(walletInfo)
      
      resolve(walletInfo.toDict())
      
    } catch {
      let rejectBlock = self.rejectBlock(error: error, code: 400)
      reject(rejectBlock.0, rejectBlock.1, rejectBlock.2)
    }
  }
  
  private func loadMnemonicWithPasscode(pk: PublicKey, passcode: String) throws -> [String] {
    let context = LAContext()
    context.setCredential(Data(passcode.utf8), type: .applicationPassword)
    let mnemonic = try keychainService?.string(forKey: "\(pk)-password",
                                              context: context,
                                              accessControl: .password)
    return mnemonic?.components(separatedBy: " ") ?? []
  }
  
  private func loadMnemonicWithBiometry(pk: PublicKey, completion: @escaping (Result<[String], Error>) -> Void) {
    if let accessibility = keychainService?.accessibility, let accessControl = AccessControl.biometry.rawValue(accessibility: accessibility) {
      let biometryContext = LAContext()
      biometryContext.evaluateAccessControl(accessControl,
                                            operation: .useItem,
                                            localizedReason: "Need localized") { success, error in
        if success {
          do {
            let mnemonic = try self.keychainService?.string(forKey: "\(pk)-biometry",
                                                           context: biometryContext,
                                                           accessControl: .biometry)
            completion(.success(mnemonic?.components(separatedBy: " ") ?? []))
          } catch {
            completion(.failure(error))
          }
        } else if let error = error {
          completion(.failure(error))
        }
      }
    }
  }
  
  private func loadKeyPairWithBiometry(pk: PublicKey, completion: @escaping (Result<KeyPair, Error>) -> Void) {
    loadMnemonicWithBiometry(pk: pk) { result in
      var rejectError: Error?
      switch result {
      case .success(let mnemonicArray):
        do {
          let keyPair = try Mnemonic.mnemonicToPrivateKey(mnemonicArray: mnemonicArray, password: "")
          completion(.success(keyPair))
        } catch {
          rejectError = error
        }
        
      case .failure(let error):
        rejectError = error
      }
      
      if let error = rejectError {
        completion(.failure(error))
      }
    }
  }
  
  private func insertWallet(_ walletInfo: WalletInfo) {
    if let index = userDefaultsService?.wallets.firstIndex(where: { $0.pubkey == walletInfo.pubkey }) {
      userDefaultsService?.wallets[index] = walletInfo
    } else {
      userDefaultsService?.wallets.append(walletInfo)
    }
  }
  
  private func validatePasscode(completion: @escaping (String?) -> Void) {
    DispatchQueue.main.async {
      self.uiService?.validatePasscode { completion($0) }
    }
  }
  
  private func rejectBlock(error: Error, code: Int) -> (String?, String, NSError) {
    let foundationError = NSError(domain: Constants.bundleIdentifier, code: code)
    if let error = error as? WalletError {
      return (error.code, error.message, foundationError)
    } else if let error = error as? TweetNaclError {
      return (error.errorDescription, error.localizedDescription, foundationError)
    } else if let error = error as? KeychainServiceError {
      return ("\(error.code)", error.localizedDescription, foundationError)
    } else {
      return (nil, error.localizedDescription, foundationError)
    }
  }
  
}
