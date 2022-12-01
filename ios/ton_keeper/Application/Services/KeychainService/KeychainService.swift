import Foundation
import Security
import LocalAuthentication

typealias RetrieveFunction = (_ query: CFDictionary, _ result: UnsafeMutablePointer<CFTypeRef?>?) -> OSStatus
typealias RemoveFunction = (_ query: CFDictionary) -> OSStatus

struct KeychainService {
  let service: String
  let accessGroup: String?
  let accessibility: Accessibility
  let isSynchronizable: Bool
  let attributes: [String: Any]
  
  static let passcodeKeyPath = "passcode"
  
  var retrieve: RetrieveFunction = SecItemCopyMatching
  var remove: RemoveFunction = SecItemDelete
  
  let context: LAContext?
  init(service: String = Bundle.main.bundleIdentifier!,
       accessGroup: String? = nil,
       accessibility: Accessibility = .whenUnlockedThisDeviceOnly,
       context: LAContext? = nil,
       synchronizable: Bool = false,
       attributes: [String: Any] = [:]) {
    self.service = service
    self.accessGroup = accessGroup
    self.accessibility = accessibility
    self.context = context
    self.isSynchronizable = synchronizable
    self.attributes = attributes
  }
  
  private func assertSuccess(forStatus status: OSStatus) throws {
    if status != errSecSuccess {
      throw KeychainServiceError(code: KeychainServiceError.Code(rawValue: status))
    }
  }
}

// MARK: - Retrieve items
extension KeychainService {
  func string(forKey key: String, context: LAContext? = nil, accessControl: AccessControl? = nil) throws -> String {
    let data = try self.data(forKey: key, context: context, accessControl: accessControl)
    
    guard let result = String(data: data, encoding: .utf8) else {
      let message = "Unable to convert the retrieved item to a String value"
      throw KeychainServiceError(code: KeychainServiceError.Code.unknown(message: message))
    }
    
    return result
  }
  
  func data(forKey key: String, context: LAContext? = nil, accessControl: AccessControl? = nil) throws -> Data {
    let query = getOneQuery(byKey: key, context: context, accessControl: accessControl)
    var result: AnyObject?
    try assertSuccess(forStatus: retrieve(query as CFDictionary, &result))
    
    guard let data = result as? Data else {
      let message = "Unable to cast the retrieved item to a Data value"
      throw KeychainServiceError(code: KeychainServiceError.Code.unknown(message: message))
    }
    
    return data
  }
}

// MARK: - Store items
extension KeychainService {
  func set(_ string: String, forKey key: String, context: LAContext? = nil, accessControl: AccessControl? = nil) throws {
    return try set(Data(string.utf8), forKey: key, context: context, accessControl: accessControl)
  }
  
  func set(_ data: Data, forKey key: String, context: LAContext? = nil, accessControl: AccessControl? = nil) throws {
    try? deleteItem(forKey: key)
    
    let addItemQuery = setQuery(forKey: key, data: data, context: context, accessControl: accessControl)
    let addStatus = SecItemAdd(addItemQuery as CFDictionary, nil)
    
    if addStatus == KeychainServiceError.duplicateItem.status {
      let updateQuery = baseQuery(withKey: key, context: context)
      let updateAttributes: [String: Any] = [kSecValueData as String: data]
      let updateStatus = SecItemUpdate(updateQuery as CFDictionary, updateAttributes as CFDictionary)
      try assertSuccess(forStatus: updateStatus)
    } else {
      try assertSuccess(forStatus: addStatus)
    }
  }
}

// MARK: - Delete items
extension KeychainService {
  func deleteItem(forKey key: String) throws {
    let query = baseQuery(withKey: key)
    try assertSuccess(forStatus: remove(query as CFDictionary))
  }
  
  func deleteAll() throws {
    let query = baseQuery()
    let status = remove(query as CFDictionary)
    guard KeychainServiceError.Code(rawValue: status) != KeychainServiceError.Code.itemNotFound else { return }
    try assertSuccess(forStatus: status)
  }
}

// MARK: - Queries
extension KeychainService {
  func getOneQuery(byKey key: String, context: LAContext? = nil, accessControl: AccessControl? = nil) -> [String: Any] {
    var query = baseQuery(withKey: key, context: context)
    query[kSecReturnData as String] = kCFBooleanTrue
    query[kSecMatchLimit as String] = kSecMatchLimitOne
    
    if let accessControl = accessControl, let rawValue = accessControl.rawValue(accessibility: accessibility) {
      query[kSecAttrAccessControl as String] = rawValue
      switch accessControl {
      case .password:
        query[kSecUseAuthenticationUI as String] = kSecUseAuthenticationUIFail
      case .biometry:
        query[kSecUseAuthenticationUI as String] = kSecUseAuthenticationUISkip
      }
      
    } else {
      query[kSecAttrAccessible as String] = accessibility.rawValue
    }
    
    return query
  }
  
  func setQuery(forKey key: String, data: Data, context: LAContext? = nil, accessControl: AccessControl? = nil) -> [String: Any] {
    var query = baseQuery(withKey: key, data: data, context: context)
    
    if let accessControl = accessControl, let rawValue = accessControl.rawValue(accessibility: accessibility) {
      query[kSecAttrAccessControl as String] = rawValue
    } else {
      query[kSecAttrAccessible as String] = accessibility.rawValue
    }
    
    return query
  }
  
  func baseQuery(withKey key: String? = nil, data: Data? = nil, context: LAContext? = nil) -> [String: Any] {
    var query = attributes
    query[kSecClass as String] = kSecClassGenericPassword
    query[kSecAttrService as String] = service
    
    if let key = key {
      query[kSecAttrAccount as String] = key
    }
    if let data = data {
      query[kSecValueData as String] = data
    }
    if let accessGroup = accessGroup {
      query[kSecAttrAccessGroup as String] = accessGroup
    }
    if let context = context ?? self.context {
      query[kSecUseAuthenticationContext as String] = context
    }
    if isSynchronizable {
      query[kSecAttrSynchronizable as String] = kCFBooleanTrue
    }
    
    return query
  }
  
}
