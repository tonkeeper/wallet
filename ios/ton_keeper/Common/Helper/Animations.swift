import UIKit

enum Animations {
  
  static func shake(view: UIView, completion: (() -> Void)? = nil) {
    CATransaction.begin()
    let animation = CABasicAnimation(keyPath: "position")
    animation.duration = 0.1
    animation.repeatCount = 2
    animation.autoreverses = true
    animation.fromValue = NSValue(cgPoint: CGPoint(x: view.center.x - 8, y: view.center.y))
    animation.toValue = NSValue(cgPoint: CGPoint(x: view.center.x + 8, y: view.center.y))
    CATransaction.setCompletionBlock(completion)
    
    view.layer.add(animation, forKey: "position")
    
    CATransaction.commit()
  }
  
}
