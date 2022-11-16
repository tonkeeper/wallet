import Foundation

enum WalletError: LocalizedError {
  case noAvailableWallets
  case invalidMnemonic
  case noAvailableMethod
  
  var code: String {
    switch self {
    case .noAvailableWallets:
      return "NO_AVAILABLE_WALLETS"
      
    case .invalidMnemonic:
      return "INVALID_MNEMONIC"
      
    case .noAvailableMethod:
      return "NO_AVAILABLE_METHOD"
    }
  }
  
  var message: String {
    switch self {
    case .noAvailableWallets:
      return "No available wallets"
      
    case .invalidMnemonic:
      return "Invalid mnemonic"
      
    case .noAvailableMethod:
      return "No available method"
    }
  }
  
  var foundationError: NSError {
    switch self {
    case .noAvailableWallets:
      return NSError(domain: Constants.bundleIdentifier, code: 404)
      
    case .invalidMnemonic:
      return NSError(domain: Constants.bundleIdentifier, code: 400)
      
    case .noAvailableMethod:
      return NSError(domain: Constants.bundleIdentifier, code: 400)
    }
  }
  
}
