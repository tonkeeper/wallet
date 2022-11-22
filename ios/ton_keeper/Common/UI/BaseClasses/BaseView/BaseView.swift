import UIKit

class BaseView: UIView, ThemeStyled {
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    initSetup()
  }
  
  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }
  
  override func awakeFromNib() {
    super.awakeFromNib()
    initSetup()
  }
  
  func initSetup() {
    updateTheme()
    NotificationCenter.default.addObserver(self, selector: #selector(themeDidChanged),
                                           name: Theme.changedNotification, object: nil)
  }
  
  func updateTheme() {
    
  }
  
  override func didMoveToSuperview() {
    super.didMoveToSuperview()
    
    updateTheme()
  }
  
  @objc
  private func themeDidChanged(_ notification: Notification) {
    updateTheme()
  }
}
