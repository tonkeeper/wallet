import UIKit

@objc
final class UIService: NSObject {
  
  var isAppUnlocked = false
  
  private let reactRootViewController: UIViewController
  
  @Autowired private var userDefaultsService: UserDefaultsService?
  @Autowired private var keychainService: KeychainService?
  @Autowired private var biometryService: BiometryService?
  private(set) lazy var window: UIWindow = {
    let window = UIWindow(frame: UIScreen.main.bounds)
    window.makeKeyAndVisible()
    
    return window
  }()
  
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
  
  private func openSplash(animated: Bool) {
    let storyboard = UIStoryboard(name: "SplashScreen", bundle: Bundle.main)
    let viewController = storyboard.instantiateViewController(withIdentifier: "SplashScreenViewController")
    setRootViewController(viewController, animated: animated)
  }
  
  private func openPasscode(animated: Bool) {
    let viewController = PassCodeViewController()
    viewController.modalPresentationStyle = .fullScreen
    setRootViewController(viewController, animated: animated)
  }
  
  private func openReact(animated: Bool) {
    setRootViewController(reactRootViewController, animated: animated)
  }
  
}
