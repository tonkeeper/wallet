import UIKit

class PassCodeView: BaseView {
  
  let logOutButton = ActionButton(actionType: .logOut)
  
  let closeButton: ActionButton = {
    let button = ActionButton(actionType: .close)
    button.isHidden = true
    
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
  
  let passCodeCircles = UIStackView(views: [PassCodeCircleView(), PassCodeCircleView(), PassCodeCircleView(), PassCodeCircleView()],
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
    addSubview(closeButton)
    
    biometricButton.alpha = 0
    deleteButton.alpha = 0
    
    buttonsStack.layoutMargins = UIEdgeInsets(top: 0.0, left: 16.0, bottom: 0.0, right: 16.0)
    buttonsStack.isLayoutMarginsRelativeArrangement = true
    
    setupConstraints()
  }
  
  override func updateTheme() {
    super.updateTheme()
    
    backgroundColor = theme.color.bgPrimary
    
    titleLabel.textColor = theme.color.fgPrimary
    attemptsCountLabel.textColor = theme.color.fgSecondary
  }
  
  private func setupConstraints() {
    logOutButton.translatesAutoresizingMaskIntoConstraints = false
    rootStack.translatesAutoresizingMaskIntoConstraints = false
    closeButton.translatesAutoresizingMaskIntoConstraints = false
    
    NSLayoutConstraint.activate([
      closeButton.topAnchor.constraint(equalTo: safeAreaLayoutGuide.topAnchor, constant: 16.0),
      closeButton.leftAnchor.constraint(equalTo: self.leftAnchor, constant: 16.0),
      closeButton.heightAnchor.constraint(equalToConstant: 32.0),
      closeButton.widthAnchor.constraint(equalToConstant: 32.0),
      
      logOutButton.topAnchor.constraint(equalTo: safeAreaLayoutGuide.topAnchor, constant: 16.0),
      logOutButton.rightAnchor.constraint(equalTo: self.rightAnchor, constant: -16.0),
      
      rootStack.topAnchor.constraint(equalTo: safeAreaLayoutGuide.topAnchor),
      rootStack.leftAnchor.constraint(equalTo: self.leftAnchor),
      rootStack.rightAnchor.constraint(equalTo: self.rightAnchor),
      rootStack.bottomAnchor.constraint(equalTo: safeAreaLayoutGuide.bottomAnchor),
      
      bottomSpacer.heightAnchor.constraint(equalTo: topSpacer.heightAnchor)
    ])
  }
  
}
