import UIKit

protocol PassCodeViewInput: AnyObject {
  func configureTitle(isCreate: Bool, createPassCodeStep: CreatePassCodeStep)
  func updateBlockTime(minutesLeft: Int)
  func updateAttempts(count: Int)
  func updateCircle(at index: Int, type: PassCodeCircleView.CircleType)
  func setupBiometricButton(image: UIImage?, alpha: CGFloat)
  func successPasscodeCircle(completion: @escaping () -> Void)
  func errorPasscodeCircles()
  func resetPassodeCircles()
  func close()
}

class PassCodeViewController: BaseViewController<PassCodeView> {
  
  var output: PassCodeViewOutput?
  
  private lazy var buttons: [PassCodeButton] = [
    mainView.button1, mainView.button2, mainView.button3,
    mainView.button4, mainView.button5, mainView.button6,
    mainView.button7, mainView.button8, mainView.button9,
    mainView.biometricButton, mainView.button0, mainView.deleteButton
  ]
  private lazy var passCodeCircles = mainView.passCodeCircles.arrangedSubviews.compactMap({ $0 as? PassCodeCircleView })
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    mainView.closeButton.addAction { [weak self] in
      self?.output?.close()
    }
    mainView.logOutButton.addAction { [weak self] in
      self?.output?.logOut()
    }
    
    buttons.forEach({ $0.addTarget(self, action: #selector(handleButton), for: .touchUpInside) })
    
    output?.viewIsReady()
  }
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    
    mainView.closeButton.isHidden = navigationController == nil && presentingViewController == nil
  }
  
  private func enterNum(_ num: Int) {
    guard let passCodeCount = output?.passCodeCount, passCodeCount < passCodeCircles.count else { return }
    
    output?.enterNum(num)
    
    let circle = passCodeCircles[passCodeCount]
    circle.type = .filled
    circle.highlight { [weak self] in
      self?.output?.validatePasscode()
    }
  }
  
  @objc private func handleButton(_ sender: PassCodeButton) {
    sender.highlight()
    
    switch sender.type {
    case .number(let num): enterNum(num)
    case .delete: output?.deleteNum()
    case .biometric: output?.biometric()
    }
    
    mainView.deleteButton.alpha = CGFloat(output?.passCodeCount ?? 0)
  }
  
}

// MARK: - PassCodeViewInput
extension PassCodeViewController: PassCodeViewInput {
  
  func configureTitle(isCreate: Bool, createPassCodeStep: CreatePassCodeStep) {
    if isCreate {
      UIView.transition(with: mainView.titleLabel, duration: 0.3, options: .transitionFlipFromTop) {
        switch createPassCodeStep {
        case .enter: self.mainView.titleLabel.text = R.string.passCode.createNew()
        case .reenter: self.mainView.titleLabel.text = R.string.passCode.reenter()
        }
      }
    } else {
      mainView.titleLabel.text = R.string.passCode.enter()
    }
  }
  
  func updateBlockTime(minutesLeft: Int) {
    if minutesLeft > 0 {
      mainView.titleLabel.text = R.string.passCode.tryAfter(number: minutesLeft)
    } else {
      mainView.titleLabel.text = R.string.passCode.enter()
    }
  }
  
  func updateAttempts(count: Int) {
    if count == 0 {
      mainView.attemptsCountLabel.alpha = 0
    } else if count < 3 {
      mainView.attemptsCountLabel.alpha = 1
    }
    
    mainView.attemptsCountLabel.text = R.string.passCode.attemptsRemaining("\(count)")
    mainView.buttonsStack.alpha = CGFloat(count)
  }
  
  func updateCircle(at index: Int, type: PassCodeCircleView.CircleType) {
    passCodeCircles[index].type = type
  }
  
  func setupBiometricButton(image: UIImage?, alpha: CGFloat) {
    mainView.biometricButton.setImage(image, for: .normal)
    mainView.biometricButton.alpha = alpha
  }
  
  func successPasscodeCircle(completion: @escaping () -> Void) {
    Utils.impactSuccessFeedback()
    
    let group = DispatchGroup()
    passCodeCircles.forEach { circle in
      group.enter()
      circle.type = .success
      circle.highlight { group.leave() }
    }
    
    group.notify(queue: .main) {
      completion()
    }
  }
  
  func errorPasscodeCircles() {
    Utils.impactErrorFeedback()
    passCodeCircles.forEach { $0.type = .failed }
    
    Animations.shake(view: mainView.passCodeCircles) {
      self.resetPassodeCircles()
    }
  }
  
  func resetPassodeCircles() {
    mainView.deleteButton.alpha = 0
    UIView.animate(withDuration: 0.2, delay: 0.0, options: .curveEaseInOut) {
      self.passCodeCircles.forEach { $0.type = .empty }
    }
  }
  
  func close() {
    if let navigationController = navigationController {
      navigationController.popViewController(animated: true)
    } else {
      dismiss(animated: true)
    }
  }
  
}
