import Foundation

enum WalletError: LocalizedError {
  case noAvailableWallets
  case invalidMnemonic
  
  var code: String {
    switch self {
    case .noAvailableWallets:
      return "NO_AVAILABLE_WALLETS"
      
    case .invalidMnemonic:
      return "INVALID_MNEMONIC"
    }
  }
  
  var message: String {
    switch self {
    case .noAvailableWallets:
      return "No available wallets"
      
    case .invalidMnemonic:
      return "Invalid mnemonic"
    }
  }
  
  var foundationError: NSError {
    switch self {
    case .noAvailableWallets:
      return NSError(domain: Constants.bundleIdentifier, code: 404)
      
    case .invalidMnemonic:
      return NSError(domain: Constants.bundleIdentifier, code: 400)
    }
  }
  
}
