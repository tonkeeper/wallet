import Foundation

final class UserDefaultsService: NSObject {
  
  @UserDefaultWrapper(key: "isKeychainFirstLaunch", defaultValue: true)
  var isKeychainFirstLaunch: Bool
  
  @UserDefaultWrapper(key: "wallets", defaultValue: [])
  var wallets: Set<WalletInfo>
  
  @UserDefaultWrapper(key: "currentWalletInfo", defaultValue: nil)
  var currentWalletInfo: WalletInfo?
  
}
