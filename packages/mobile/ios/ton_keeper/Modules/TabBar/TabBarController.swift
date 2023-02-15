import UIKit

final class TabBarController: UITabBarController, ThemeStyled {

  override func viewDidLoad() {
    super.viewDidLoad()
    
    delegate = self
    
    configure()
  }
  
  private func configure() {
    let walletViewConroller = UIViewController()
    walletViewConroller.tabBarItem.title = R.string.tabBar.wallet()
    walletViewConroller.tabBarItem.image = R.image.walletTab()
    
    let activityViewConroller = UIViewController()
    activityViewConroller.tabBarItem.title = R.string.tabBar.activity()
    activityViewConroller.tabBarItem.image = R.image.activityTab()
    
    let browserViewConroller = UIViewController()
    browserViewConroller.tabBarItem.title = R.string.tabBar.browser()
    browserViewConroller.tabBarItem.image = R.image.browserTab()
    
    let settingsViewConroller = UIViewController()
    settingsViewConroller.tabBarItem.title = R.string.tabBar.settings()
    settingsViewConroller.tabBarItem.image = R.image.settingsTab()
    
    viewControllers = [
      UINavigationController(rootViewController: walletViewConroller),
      UINavigationController(rootViewController: activityViewConroller),
      UINavigationController(rootViewController: browserViewConroller),
      UINavigationController(rootViewController: settingsViewConroller)
    ]
    
    tabBar.backgroundColor = theme.color.bgTransparent
    tabBar.tintColor = theme.color.acPrimary
    tabBar.unselectedItemTintColor = theme.color.acInactive
  }
  
}

// MARK: - UITabBarControllerDelegate
extension TabBarController: UITabBarControllerDelegate {
  func tabBarController(_ tabBarController: UITabBarController, shouldSelect viewController: UIViewController) -> Bool {
    
    return true
  }
}
