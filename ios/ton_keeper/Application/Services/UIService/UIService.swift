import UIKit

@objc
final class UIService: NSObject {
  
  var isAppUnlocked = false
  
  private let reactRootViewController: UIViewController
  let window: UIWindow = {
    let window = UIWindow(frame: UIScreen.main.bounds)
    window.makeKeyAndVisible()
    
    return window
  }()
  
  @Autowired private var userDefaultsService: UserDefaultsService?
  @Autowired private var keychainService: KeychainService?
  @Autowired private var biometryService: BiometryService?
  
  init(reactRootViewController: UIViewController) {
    self.reactRootViewController = reactRootViewController
  }
  
  func setRootViewController(_ viewController: UIViewController, animated: Bool = false) {
    if animated {
      window.setRootViewController(viewController, options: .init(direction: .fade, style: .easeInOut))
    } else {
      window.rootViewController = viewController
    }
  }
  
  func openModule(animated: Bool = false) {
    guard !isAppUnlocked, (try? keychainService?.string(forKey: KeychainService.passcodeKeyPath)) != nil else {
      openReact(animated: animated)
      return
    }
    
    guard let isBiometryEnabled = userDefaultsService?.isBiometryEnabled, isBiometryEnabled else {
      openPasscode(animated: animated)
      return
    }
    
    openSplash(animated: false)
    biometryService?.callBiometric { [weak self] success in
      if success {
        self?.isAppUnlocked = true
        self?.openReact(animated: animated)
      } else {
        self?.openPasscode(animated: animated)
      }
    }
  }
  
  func validatePasscode(callback: @escaping (String?) -> Void) {
    let module = PassCodeModule(callback: callback)
    window.rootViewController?.present(module.viewController, animated: true)
  }
  
  private func openSplash(animated: Bool) {
    let storyboard = UIStoryboard(name: "SplashScreen", bundle: Bundle.main)
    let viewController = storyboard.instantiateViewController(withIdentifier: "SplashScreenViewController")
    setRootViewController(viewController, animated: animated)
  }
  
  private func openPasscode(animated: Bool) {
    let module = PassCodeModule()
    setRootViewController(module.viewController, animated: animated)
  }
  
  private func openReact(animated: Bool) {
    setRootViewController(reactRootViewController, animated: animated)
  }
  
}
