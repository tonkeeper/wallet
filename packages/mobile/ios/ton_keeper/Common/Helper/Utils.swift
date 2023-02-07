import Foundation
import UIKit

enum Utils {
  
  static func appDelegate() -> UIApplicationDelegate? {
    return UIApplication.shared.delegate
  }
  
  static func getRootViewController() -> UIViewController? {
    return appDelegate()?.window??.rootViewController
  }
  
  static func getPresentedViewController() -> UIViewController? {
    return getRootViewController()?.presentedViewController
  }
  
  static func getTopViewController() -> UIViewController? {
    return getRootNavigationController()?.topViewController
  }
  
  static func getRootNavigationController() -> UINavigationController? {
    return Utils.getRootViewController() as? UINavigationController
  }
  
  static func safeArea() -> UIEdgeInsets {
    if let safeArea = appDelegate()?.window??.safeAreaInsets {
      return safeArea
    } else {
      return UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
    }
  }
  
  static func impactFeedback() {
    UIImpactFeedbackGenerator(style: .light).impactOccurred()
  }
  
  static func impactErrorFeedback() {
    UINotificationFeedbackGenerator().notificationOccurred(.error)
  }
  
  static func impactSuccessFeedback() {
    UINotificationFeedbackGenerator().notificationOccurred(.success)
  }
  
}
