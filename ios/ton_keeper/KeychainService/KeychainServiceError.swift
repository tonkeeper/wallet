import Foundation

struct KeychainServiceError: LocalizedError, CustomDebugStringConvertible {
  enum Code: RawRepresentable, Equatable {
    case operationNotImplemented
    case invalidParameters
    case userCanceled
    case itemNotAvailable
    case authFailed
    case duplicateItem
    case itemNotFound
    case interactionNotAllowed
    case decodeFailed
    case other(status: OSStatus)
    case unknown(message: String)
    
    init(rawValue: OSStatus) {
      switch rawValue {
      case errSecUnimplemented: self = .operationNotImplemented
      case errSecParam: self = .invalidParameters
      case errSecUserCanceled: self = .userCanceled
      case errSecNotAvailable: self = .itemNotAvailable
      case errSecAuthFailed: self = .authFailed
      case errSecDuplicateItem: self = .duplicateItem
      case errSecItemNotFound: self = .itemNotFound
      case errSecInteractionNotAllowed: self = .interactionNotAllowed
      case errSecDecode: self = .decodeFailed
      default: self = .other(status: rawValue)
      }
    }
    
    var rawValue: OSStatus {
      switch self {
      case .operationNotImplemented: return errSecUnimplemented
      case .invalidParameters: return errSecParam
      case .userCanceled: return errSecUserCanceled
      case .itemNotAvailable: return errSecNotAvailable
      case .authFailed: return errSecAuthFailed
      case .duplicateItem: return errSecDuplicateItem
      case .itemNotFound: return errSecItemNotFound
      case .interactionNotAllowed: return errSecInteractionNotAllowed
      case .decodeFailed: return errSecDecode
      case let .other(status): return status
      case .unknown: return errSecSuccess
      }
    }
  }
  
  let code: Code
  
  init(code: Code) {
    self.code = code
  }
  
  var status: OSStatus { code.rawValue }
  var localizedDescription: String { debugDescription }
  var errorDescription: String? { debugDescription }

  var debugDescription: String {
    switch self.code {
    case .operationNotImplemented:
      return "errSecUnimplemented: A function or operation is not implemented."
      
    case .invalidParameters:
      return "errSecParam: One or more parameters passed to the function are not valid."
      
    case .userCanceled:
      return "errSecUserCanceled: User canceled the operation."
      
    case .itemNotAvailable:
      return "errSecNotAvailable: No trust results are available."
      
    case .authFailed:
      return "errSecAuthFailed: Authorization and/or authentication failed."
      
    case .duplicateItem:
      return "errSecDuplicateItem: The item already exists."
      
    case .itemNotFound:
      return "errSecItemNotFound: The item cannot be found."
      
    case .interactionNotAllowed:
      return "errSecInteractionNotAllowed: Interaction with the Security Server is not allowed."
      
    case .decodeFailed:
      return "errSecDecode: Unable to decode the provided data."
      
    case .other:
      return "Unspecified Keychain error: \(self.status)."
      
    case let .unknown(message):
      return "Unknown error: \(message)."
    }
  }

  static let operationNotImplemented: KeychainServiceError = .init(code: .operationNotImplemented)
  static let invalidParameters: KeychainServiceError = .init(code: .invalidParameters)
  static let userCanceled: KeychainServiceError = .init(code: .userCanceled)
  static let itemNotAvailable: KeychainServiceError = .init(code: .itemNotAvailable)
  static let authFailed: KeychainServiceError = .init(code: .authFailed)
  static let duplicateItem: KeychainServiceError = .init(code: .duplicateItem)
  static let itemNotFound: KeychainServiceError = .init(code: .itemNotFound)
  static let interactionNotAllowed: KeychainServiceError = .init(code: .interactionNotAllowed)
  static let decodeFailed: KeychainServiceError = .init(code: .decodeFailed)
  static let other: KeychainServiceError = .init(code: .other(status: 0))
  static let unknown: KeychainServiceError = .init(code: .unknown(message: ""))
}

// MARK: - Equatable
extension KeychainServiceError: Equatable {
  static func == (lhs: KeychainServiceError, rhs: KeychainServiceError) -> Bool {
    return lhs.code == rhs.code && lhs.localizedDescription == rhs.localizedDescription
  }
}

// MARK: - Pattern Matching Operator
extension KeychainServiceError {
  static func ~= (lhs: KeychainServiceError, rhs: KeychainServiceError) -> Bool {
    return lhs.code == rhs.code
  }
  
  static func ~= (lhs: KeychainServiceError, rhs: Error) -> Bool {
    guard let rhs = rhs as? KeychainServiceError else { return false }
    return lhs.code == rhs.code
  }
}
