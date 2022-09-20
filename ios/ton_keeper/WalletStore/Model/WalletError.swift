import Foundation

enum WalletError {
  case noAvailableWallets
  
  private var domain: String { "com.jbig.tonkeeper" }
  
  var code: String {
    switch self {
    case .noAvailableWallets:
      return "NO_AVAILABLE_WALLETS"
    }
  }
  
  var message: String {
    switch self {
    case .noAvailableWallets:
      return "No available wallets"
    }
  }
  
  var foundationError: NSError {
    switch self {
    case .noAvailableWallets:
      return NSError(domain: domain, code: 404)
    }
  }
  
}
