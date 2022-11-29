import UIKit

class PassCodeCircleView: BaseView {
  
  enum CircleType {
    case empty, filled, success, failed
  }
  
  var type: CircleType = .empty {
    didSet {
      updateTheme()
    }
  }
  
  override var intrinsicContentSize: CGSize {
    return CGSize(side: 12.0)
  }
  
  private var identityScaledAnimator: UIViewPropertyAnimator?
  private var identityAnimator: UIViewPropertyAnimator?
  
  override func updateTheme() {
    super.updateTheme()
    
    switch type {
    case .empty: backgroundColor = theme.color.bgTertiary
    case .filled: backgroundColor = theme.color.acPrimary
    case .success: backgroundColor = theme.color.acPositive
    case .failed: backgroundColor = theme.color.acNegative
    }
  }
  
  override func layoutSubviews() {
    super.layoutSubviews()
    
    layer.cornerRadius = max(bounds.height, bounds.width) / 2
  }
  
  func highlight(completion: @escaping () -> Void) {
    identityAnimator?.stopAnimation(true)
    identityScaledAnimator?.stopAnimation(true)
    
    identityScaledAnimator = UIViewPropertyAnimator(duration: 0.15, curve: .easeInOut) {
      self.transform = .identity.scaledBy(x: 1.3, y: 1.3)
    }
    identityScaledAnimator?.addCompletion { _ in
      self.identityAnimator?.startAnimation()
    }
    
    identityAnimator = UIViewPropertyAnimator(duration: 0.15, curve: .easeInOut) {
      self.transform = .identity
    }
    identityAnimator?.addCompletion { _ in
      completion()
    }
    
    identityScaledAnimator?.startAnimation()
  }
  
}
