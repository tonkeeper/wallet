import Foundation

class PassCodeModule {
  
  let viewController: PassCodeViewController
  
  init(callback: ((String?) -> Void)? = nil) {
    let viewController = PassCodeViewController()
    viewController.modalTransitionStyle = .crossDissolve
    viewController.modalPresentationStyle = .fullScreen
    
    let presenter = PassCodePresenter()
    
    viewController.output = presenter
    presenter.view = viewController
    presenter.didPasscodeEnter = callback
    
    self.viewController = viewController
  }
  
}
