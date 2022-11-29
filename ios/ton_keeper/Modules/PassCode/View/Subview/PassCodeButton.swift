import UIKit

class PassCodeButton: BaseButton {
  
  enum PassCodeType {
    case number(Int), biometric, delete
  }
  
  override var intrinsicContentSize: CGSize {
    return CGSize(width: UIView.noIntrinsicMetric, height: 72.0)
  }

  var type: PassCodeType = .number(0)
  
  private let hoverView: UIView = {
    let view = UIView()
    view.layer.cornerRadius = 36.0
    view.alpha = 0
    view.translatesAutoresizingMaskIntoConstraints = false
    
    return view
  }()
  
  private var identityScaledAnimator: UIViewPropertyAnimator?
  private var identityAnimator: UIViewPropertyAnimator?
  
  convenience init(type: PassCodeType) {
    self.init(frame: .zero)
    self.type = type
    
    layer.masksToBounds = true
    
    addSubview(hoverView)
    
    switch type {
    case .number(let num):
      setTitle("\(num)", for: .normal)
      titleLabel?.font = Palette.fontSemibold.withSize(32.0)
      
    case .biometric:
      setImage(.init(named: "passcode.faceid"), for: .normal)
      
    case .delete:
      setImage(.init(named: "passcode.delete"), for: .normal)
    }

    setupConstraints()
  }

  override func updateTheme() {
    super.updateTheme()
    
    setTitleColor(theme.color.fgPrimary, for: .normal)
    tintColor = theme.color.fgPrimary
    hoverView.backgroundColor = theme.color.bgSecondary
  }
  
  func highlight() {
    Utils.impactFeedback()
    
    hoverView.transform = .identity.scaledBy(x: 0.7, y: 0.7)
    hoverView.alpha = 0
    
    identityAnimator?.stopAnimation(true)
    identityScaledAnimator?.stopAnimation(true)
    
    identityScaledAnimator = UIViewPropertyAnimator(duration: 0.07, curve: .easeInOut) {
      self.hoverView.transform = .identity.scaledBy(x: 0.7, y: 0.7)
      self.hoverView.alpha = 0
    }
    
    identityAnimator = UIViewPropertyAnimator(duration: 0.07, curve: .easeInOut) {
      self.hoverView.transform = .identity
      self.hoverView.alpha = 1
    }
    
    identityAnimator?.addCompletion { _ in
      self.identityScaledAnimator?.startAnimation()
    }
    identityAnimator?.startAnimation()
  }
  
  private func setupConstraints() {
    NSLayoutConstraint.activate([
      .init(item: hoverView, attribute: .top, relatedBy: .equal, toItem: self, attribute: .top, multiplier: 1.0, constant: 0.0),
      .init(item: hoverView, attribute: .bottom, relatedBy: .equal, toItem: self, attribute: .bottom, multiplier: 1.0, constant: 0.0),
      .init(item: hoverView, attribute: .centerX, relatedBy: .equal, toItem: self, attribute: .centerX, multiplier: 1.0, constant: 0.0),
      .init(item: hoverView, attribute: .width, relatedBy: .equal, toItem: nil, attribute: .notAnAttribute, multiplier: 1.0, constant: 72.0),
      .init(item: hoverView, attribute: .height, relatedBy: .equal, toItem: nil, attribute: .notAnAttribute, multiplier: 1.0, constant: 72.0)
    ])
  }
  
}
