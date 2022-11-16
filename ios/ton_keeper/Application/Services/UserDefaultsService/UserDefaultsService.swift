import Foundation

final class UserDefaultsService: NSObject {
  
  @UserDefaultWrapper(key: "isKeychainFirstLaunch", defaultValue: true)
  var isKeychainFirstLaunch: Bool
  
  @UserDefaultWrapper(key: "currentTheme", defaultValue: Theme.system.rawValue)
  var currentTheme: Int
  
  @UserDefaultWrapper(key: "wallets", defaultValue: [])
  var wallets: [WalletInfo]
  
  @UserDefaultWrapper(key: "currentWalletPubkey", defaultValue: nil)
  var currentWalletPubkey: String?
  
  @UserDefaultWrapper(key: "isBiometryEnabled", defaultValue: true)
  var isBiometryEnabled: Bool
  
}
