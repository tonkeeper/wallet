import UIKit

class ActionButton: BaseButton {
  
  enum ActionType {
    case text(String?)
    case logOut
    case close
  }
  
  private let actionType: ActionType
  private var action: (() throws -> Void)?
  
  init(actionType: ActionType) {
    self.actionType = actionType
    super.init(frame: .zero)
    
    switch actionType {
    case .text(let text):
      setupFor(text: text)
      
    case .logOut:
      setupFor(text: R.string.passCode.logout())
      
    case .close:
      setImage(R.image.commonClose16(), for: .normal)
    }
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  override func layoutSubviews() {
    super.layoutSubviews()
    
    switch actionType {
    case .text, .logOut:
      layer.cornerRadius = 16.0
      
    case .close:
      layer.cornerRadius = max(bounds.height, bounds.width) / 2
    }
  }
  
  override func updateTheme() {
    super.updateTheme()
    
    switch actionType {
    case .text, .logOut:
      setTitleColor(theme.color.fgPrimary, for: .normal)
      backgroundColor = theme.color.bgSecondary
      
    case .close:
      backgroundColor = theme.color.bgSecondary
    }
  }
  
  func addAction(_ action: @escaping ( ) throws -> Void) {
    self.action = action
    addTarget(self, action: #selector(useAction), for: .touchUpInside)
  }
  
  private func setupFor(text: String?) {
    setTitle(text, for: .normal)
    titleLabel?.font = Palette.fontSemibold.withSize(14.0)
    contentEdgeInsets = UIEdgeInsets(top: 6.0, left: 12.0, bottom: 6.0, right: 12.0)
  }
  
  @objc private func useAction() throws {
    do {
      try action?()
    } catch {
      throw AppError(RoutingErrorCode.failedRouting.rawValue)
    }
  }
  
}
