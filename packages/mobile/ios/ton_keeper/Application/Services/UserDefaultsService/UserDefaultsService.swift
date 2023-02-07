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
  
  @UserDefaultWrapper(key: "isBiometryEnabled", defaultValue: false)
  var isBiometryEnabled: Bool
  
  @UserDefaultWrapper(key: "passCodeAttemptsCount", defaultValue: 3)
  var passCodeAttemptsCount: Int
  
  @UserDefaultWrapper(key: "passCodeBlockDate", defaultValue: nil)
  var passCodeBlockDate: Date?
  
  @UserDefaultWrapper(key: "passCodeBlockTime", defaultValue: PassCodeBlockTime.minute1)
  var passCodeBlockTime: PassCodeBlockTime
  
  func clear() {
    wallets = []
    currentWalletPubkey = nil
    isBiometryEnabled = false
    
    passCodeAttemptsCount = 3
    passCodeBlockDate = nil
    passCodeBlockTime = .minute1
  }
  
}
