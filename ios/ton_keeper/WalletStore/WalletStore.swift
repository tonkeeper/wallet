import Foundation
import TonMnemonicSwift

@objc(WalletStore)
@objcMembers
class WalletStore: NSObject {
  
  private let userDefaultsService = UserDefaultsService()
  private let keychainService = KeychainService()
  
  static func requiresMainQueueSetup() -> Bool { false }
  
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
  
  func importWallet(words: [String],
                    _ resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock) {
    guard Mnemonic.mnemonicValidate(mnemonicArray: words, password: "") else {
      let error = WalletError.invalidMnemonic
      reject(error.code, error.message, error.foundationError)
      
      return
    }
    
    do {
      let keyPair = try Mnemonic.mnemonicToPrivateKey(mnemonicArray: words, password: "")
      let pubkey = keyPair.publicKey.hexString()
      let walletInfo = WalletInfo(pubkey: pubkey, label: "")
      
      try keychainService.set(words.joined(separator: " "), forKey: pubkey)
      userDefaultsService.wallets.insert(walletInfo)
      
      resolve(pubkey)
      
    } catch {
      let foundationError = NSError(domain: Constants.bundleIdentifier, code: 400)
      if let error = error as? TweetNaclError {
        reject(error.errorDescription, error.localizedDescription, foundationError)
      } else if let error = error as? KeychainServiceError {
        reject("\(error.code)", error.localizedDescription, foundationError)
      } else {
        reject(nil, error.localizedDescription, foundationError)
      }
    }
  }
  
  func getWallet(pk: String,
                 _ resolve: @escaping RCTPromiseResolveBlock,
                 reject: @escaping RCTPromiseRejectBlock) {
    if let wallet = userDefaultsService.wallets.first(where: {$0.pubkey == pk }) {
      resolve(wallet.toDict())
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func getWalletByAddress(address: String,
                          _ resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    if let wallet = userDefaultsService.wallets.first(where: {$0.pubkey == address }) {
      resolve(wallet.toDict())
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func updateWallet(pk: String, label: String,
                    _ resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock) {
    if let index = userDefaultsService.wallets.firstIndex(where: { $0.pubkey == pk }) {
      userDefaultsService.wallets[index].label = label
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
  
  func setCurrentWallet(pk: String,
                        _ resolve: @escaping RCTPromiseResolveBlock,
                        reject: @escaping RCTPromiseRejectBlock) {
    if let wallet = userDefaultsService.wallets.first(where: { $0.pubkey == pk }) {
      userDefaultsService.currentWalletInfo = wallet
      resolve(true)
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
}
