import Foundation
import Security
#if canImport(LocalAuthentication)
import LocalAuthentication
#endif

typealias RetrieveFunction = (_ query: CFDictionary, _ result: UnsafeMutablePointer<CFTypeRef?>?) -> OSStatus
typealias RemoveFunction = (_ query: CFDictionary) -> OSStatus

struct KeychainService {
  let service: String
  let accessGroup: String?
  let accessibility: Accessibility
  let accessControlFlags: SecAccessControlCreateFlags?
  let isSynchronizable: Bool
  let attributes: [String: Any]
  
  var retrieve: RetrieveFunction = SecItemCopyMatching
  var remove: RemoveFunction = SecItemDelete
  
  #if canImport(LocalAuthentication)
  let context: LAContext?
  init(service: String = Bundle.main.bundleIdentifier!,
       accessGroup: String? = nil,
       accessibility: Accessibility = .whenUnlockedThisDeviceOnly,
       accessControlFlags: SecAccessControlCreateFlags? = nil,
       context: LAContext? = nil,
       synchronizable: Bool = false,
       attributes: [String: Any] = [:]) {
    self.service = service
    self.accessGroup = accessGroup
    self.accessibility = accessibility
    self.accessControlFlags = accessControlFlags
    self.context = context
    self.isSynchronizable = synchronizable
    self.attributes = attributes
  }
  #else
  init(service: String = Bundle.main.bundleIdentifier!,
       accessGroup: String? = nil,
       accessibility: Accessibility = .whenUnlockedThisDeviceOnly,
       accessControlFlags: SecAccessControlCreateFlags? = nil,
       synchronizable: Bool = false,
       attributes: [String: Any] = [:]) {
    self.service = service
    self.accessGroup = accessGroup
    self.accessibility = accessibility
    self.accessControlFlags = accessControlFlags
    self.isSynchronizable = synchronizable
    self.attributes = attributes
  }
  #endif
  
  private func assertSuccess(forStatus status: OSStatus) throws {
    if status != errSecSuccess {
      throw KeychainServiceError(code: KeychainServiceError.Code(rawValue: status))
    }
  }
}

// MARK: - Retrieve items
extension KeychainService {
  func string(forKey key: String) throws -> String {
    let data = try self.data(forKey: key)
    
    guard let result = String(data: data, encoding: .utf8) else {
      let message = "Unable to convert the retrieved item to a String value"
      throw KeychainServiceError(code: KeychainServiceError.Code.unknown(message: message))
    }
    
    return result
  }
  
  func data(forKey key: String) throws -> Data {
    let query = getOneQuery(byKey: key)
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
  func set(_ string: String, forKey key: String) throws {
    return try set(Data(string.utf8), forKey: key)
  }
  
  func set(_ data: Data, forKey key: String) throws {
    let addItemQuery = setQuery(forKey: key, data: data)
    let addStatus = SecItemAdd(addItemQuery as CFDictionary, nil)
    
    if addStatus == KeychainServiceError.duplicateItem.status {
      let updateQuery = baseQuery(withKey: key)
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

// MARK: - Convenience methods
extension KeychainService {
  func hasItem(forKey key: String) throws -> Bool {
    let query = baseQuery(withKey: key)
    let status = retrieve(query as CFDictionary, nil)
    
    if status == KeychainServiceError.itemNotFound.status {
      return false
    }
    
    try assertSuccess(forStatus: status)
    
    return true
  }

  func keys() throws -> [String] {
    let query = getAllQuery
    var keys: [String] = []
    var result: AnyObject?
    let status = retrieve(query as CFDictionary, &result)
    guard KeychainServiceError.Code(rawValue: status) != KeychainServiceError.Code.itemNotFound else { return keys }
    try assertSuccess(forStatus: status)
    
    guard let items = result as? [[String: Any]] else {
      let message = "Unable to cast the retrieved items to a [[String: Any]] value"
      throw KeychainServiceError(code: KeychainServiceError.Code.unknown(message: message))
    }
    
    for item in items {
      if let key = item[kSecAttrAccount as String] as? String {
        keys.append(key)
      }
    }
    
    return keys
  }
}

// MARK: - Queries
extension KeychainService {
  func baseQuery(withKey key: String? = nil, data: Data? = nil) -> [String: Any] {
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
    #if canImport(LocalAuthentication)
    if let context = context {
      query[kSecUseAuthenticationContext as String] = context
    }
    #endif
    if isSynchronizable {
      query[kSecAttrSynchronizable as String] = kCFBooleanTrue
    }
    
    return query
  }
  
  var getAllQuery: [String: Any] {
    var query = baseQuery()
    query[kSecReturnAttributes as String] = kCFBooleanTrue
    query[kSecMatchLimit as String] = kSecMatchLimitAll
    
    return query
  }
  
  func getOneQuery(byKey key: String) -> [String: Any] {
    var query = baseQuery(withKey: key)
    query[kSecReturnData as String] = kCFBooleanTrue
    query[kSecMatchLimit as String] = kSecMatchLimitOne
    
    return query
  }
  
  func setQuery(forKey key: String, data: Data) -> [String: Any] {
    var query = baseQuery(withKey: key, data: data)
    
    if let flags = accessControlFlags,
       let access = SecAccessControlCreateWithFlags(kCFAllocatorDefault, accessibility.rawValue, flags, nil) {
      query[kSecAttrAccessControl as String] = access
    } else {
      query[kSecAttrAccessible as String] = accessibility.rawValue
    }
    
    return query
  }
}
