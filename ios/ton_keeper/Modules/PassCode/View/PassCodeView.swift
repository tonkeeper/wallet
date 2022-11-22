import UIKit

class PassCodeView: BaseView {
  
  let logOutButton: UIButton = {
    let button = UIButton()
    button.titleLabel?.font = Palette.fontSemibold.withSize(14.0)
    button.setTitle(R.string.passCode.logout(), for: .normal)
    button.contentEdgeInsets = UIEdgeInsets(top: 6.0, left: 12.0, bottom: 6.0, right: 12.0)
    button.layer.cornerRadius = 16.0
    
    return button
  }()
  
  let titleLabel: UILabel = {
    let label = UILabel()
    label.text = R.string.passCode.enter()
    label.font = Palette.fontBold.withSize(20.0)
    
    return label
  }()
  
  let attemptsCountLabel: UILabel = {
    let label = UILabel()
    label.text = R.string.passCode.attemptsRemaining("\(0)")
    label.font = Palette.fontMedium.withSize(14.0)
    label.alpha = 0
    
    return label
  }()
  
  let passCodeCircles = UIStackView(views: [CircleView(), CircleView(), CircleView(), CircleView()],
                                            axis: .horizontal,
                                            spacing: 16.0)
  
  let button0 = PassCodeButton(type: .number(0))
  let button1 = PassCodeButton(type: .number(1))
  let button2 = PassCodeButton(type: .number(2))
  let button3 = PassCodeButton(type: .number(3))
  let button4 = PassCodeButton(type: .number(4))
  let button5 = PassCodeButton(type: .number(5))
  let button6 = PassCodeButton(type: .number(6))
  let button7 = PassCodeButton(type: .number(7))
  let button8 = PassCodeButton(type: .number(8))
  let button9 = PassCodeButton(type: .number(9))
  let biometricButton = PassCodeButton(type: .biometric)
  let deleteButton = PassCodeButton(type: .delete)
  
  private(set) lazy var buttonsStack = UIStackView(views: [
    UIStackView(views: [button1, button2, button3], axis: .horizontal, spacing: 24.0, distribution: .fillEqually),
    UIStackView(views: [button4, button5, button6], axis: .horizontal, spacing: 24.0, distribution: .fillEqually),
    UIStackView(views: [button7, button8, button9], axis: .horizontal, spacing: 24.0, distribution: .fillEqually),
    UIStackView(views: [biometricButton, button0, deleteButton], axis: .horizontal, spacing: 24.0, distribution: .fillEqually)
  ], distribution: .fillEqually)
  
  private let topSpacer = SpacerView()
  private let bottomSpacer = SpacerView()
  
  private lazy var rootStack = UIStackView(views: [
    topSpacer,
    UIStackView(views: [titleLabel, passCodeCircles, attemptsCountLabel], spacing: 18.0, alignment: .center),
    bottomSpacer,
    buttonsStack
  ])
  
  override func initSetup() {
    super.initSetup()
    
    addSubview(rootStack)
    addSubview(logOutButton)
    
    biometricButton.alpha = 0
    deleteButton.alpha = 0
    
    buttonsStack.layoutMargins = UIEdgeInsets(top: 0.0, left: 16.0, bottom: 0.0, right: 16.0)
    buttonsStack.isLayoutMarginsRelativeArrangement = true
    
    setupConstraints()
  }
  
  override func updateTheme() {
    super.updateTheme()
    
    backgroundColor = theme.color.bgPrimary
    
    logOutButton.setTitleColor(theme.color.fgPrimary, for: .normal)
    logOutButton.backgroundColor = theme.color.bgSecondary
    titleLabel.textColor = theme.color.fgPrimary
    attemptsCountLabel.textColor = theme.color.fgSecondary
  }
  
  private func setupConstraints() {
    logOutButton.translatesAutoresizingMaskIntoConstraints = false
    rootStack.translatesAutoresizingMaskIntoConstraints = false
    
    NSLayoutConstraint.activate([
      .init(item: logOutButton, attribute: .top, relatedBy: .equal, toItem: safeAreaLayoutGuide, attribute: .top, multiplier: 1.0, constant: 16.0),
      .init(item: logOutButton, attribute: .right, relatedBy: .equal, toItem: self, attribute: .right, multiplier: 1.0, constant: -16.0),
      
      .init(item: rootStack, attribute: .top, relatedBy: .equal, toItem: safeAreaLayoutGuide, attribute: .top, multiplier: 1.0, constant: 0.0),
      .init(item: rootStack, attribute: .left, relatedBy: .equal, toItem: self, attribute: .left, multiplier: 1.0, constant: 0.0),
      .init(item: rootStack, attribute: .right, relatedBy: .equal, toItem: self, attribute: .right, multiplier: 1.0, constant: 0.0),
      .init(item: rootStack, attribute: .bottom, relatedBy: .equal, toItem: safeAreaLayoutGuide, attribute: .bottom, multiplier: 1.0, constant: -16.0),
      
      .init(item: bottomSpacer, attribute: .height, relatedBy: .equal, toItem: topSpacer, attribute: .height, multiplier: 1.0, constant: 1.0)
    ])
  }
  
}
