import Foundation

@objc(WalletStore)
@objcMembers
class WalletStore: NSObject {
  
  private var userDefaultsService = UserDefaultsService()
  
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
  
  func importWallet(seed: String,
                    _ resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock) {
    resolve(true)
  }
  
  func getWallet(id: String,
                 _ resolve: @escaping RCTPromiseResolveBlock,
                 reject: @escaping RCTPromiseRejectBlock) {
    if let wallet = userDefaultsService.wallets.first(where: {$0.id == id }) {
      resolve(wallet.toDict())
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func getWalletByAddress(address: String,
                          _ resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    if let wallet = userDefaultsService.wallets.first(where: {$0.id == address }) {
      resolve(wallet.toDict())
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
  func updateWallet(id: String, label: String,
                    _ resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock) {
    if let index = userDefaultsService.wallets.firstIndex(where: { $0.id == id }) {
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
  
  func setCurrentWallet(id: String,
                        _ resolve: @escaping RCTPromiseResolveBlock,
                        reject: @escaping RCTPromiseRejectBlock) {
    if let wallet = userDefaultsService.wallets.first(where: { $0.id == id }) {
      userDefaultsService.currentWalletInfo = wallet
      resolve(true)
    } else {
      let error = WalletError.noAvailableWallets
      reject(error.code, error.message, error.foundationError)
    }
  }
  
}
