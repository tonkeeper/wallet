import Foundation

@objcMembers
final class ServiceLocator: NSObject {
  
  private lazy var services: [String: Any] = [:]
  
  func setupServices(reactRootViewController: UIViewController) {
    let userDefaultsService = UserDefaultsService()
    add(service: userDefaultsService)
    
    let keychainService = KeychainService()
    add(service: keychainService)
    
    let biometryService = BiometryService()
    add(service: biometryService)
    
    let uiService = UIService(reactRootViewController: reactRootViewController)
    add(service: uiService)
    
    let authService = AuthService()
    add(service: authService)
    
    uiService.openModule(animated: true)
  }
  
  func add<T>(service: T) {
    let key = "\(T.self)"
    services[key] = service
  }
  
  func getService<T>() -> T? {
    let key = "\(T.self)"
    return services[key] as? T
  }
  
  func getAny<T>() -> T? {
    services.compactMap({ $0.value as? T }).first
  }
}

extension ServiceLocator {
  static let shared = ServiceLocator()
  
  static func getService<T>() -> T? {
    Self.shared.getService()
  }
  
  static func getAny<T>() -> T? {
    Self.shared.getAny()
  }
}
