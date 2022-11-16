import UIKit

@objc class BaseViewController: UIViewController, ThemeStyled {
  
    override func viewDidLoad() {
        super.viewDidLoad()
        
        updateTheme()
        NotificationCenter.default.addObserver(self, selector: #selector(themeDidChanged),
                                               name: Theme.changedNotification, object: nil)

        navigationController?.interactivePopGestureRecognizer?.delegate = nil
    }
    override var preferredStatusBarStyle: UIStatusBarStyle { theme.statusBarStyle }
    
    func updateTheme() { }

    @objc private func themeDidChanged(_ notification: Notification) {
        updateTheme()
        setNeedsStatusBarAppearanceUpdate()
    }
    
}
