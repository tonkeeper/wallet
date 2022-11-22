import UIKit

class PassCodeViewController: BaseViewController<PassCodeView> {
  
  @Autowired private var keychainService: KeychainService?
  @Autowired private var biometryService: BiometryService?
  @Autowired private var uiService: UIService?
  @Autowired private var userDefaultsService: UserDefaultsService?
  private var localPasscode = ""
  private var timer: Timer?
  private lazy var buttons: [PassCodeButton] = [
    mainView.button1, mainView.button2, mainView.button3,
    mainView.button4, mainView.button5, mainView.button6,
    mainView.button7, mainView.button8, mainView.button9,
    mainView.biometricButton, mainView.button0, mainView.deleteButton
  ]
  private lazy var passCodeCircles = mainView.passCodeCircles.arrangedSubviews.compactMap({ $0 as? CircleView })
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    mainView.logOutButton.addTarget(self, action: #selector(logOut), for: .touchUpInside)
    buttons.forEach({ $0.addTarget(self, action: #selector(handleButton), for: .touchUpInside) })
    
    configure()
  }
  
  private func configure() {
    if let isFaceIdAvailable = biometryService?.isFaceIdAvailable {
      let image = isFaceIdAvailable ? R.image.passcodeFaceid() : R.image.passcodeTouchid()
      mainView.biometricButton.setImage(image, for: .normal)
      mainView.biometricButton.alpha = 1
    } else {
      mainView.biometricButton.alpha = 0
    }
    
    updateAttemptsState()
  }
  
  private func enterNum(_ num: Int) {
    guard localPasscode.count < passCodeCircles.count else { return }
    
    localPasscode += "\(num)"
    
    let circle = passCodeCircles[localPasscode.count - 1]
    circle.backgroundColor = Theme.currentTheme.color.acPrimary
    circle.highlight {
      if self.localPasscode.count >= 4 {
        if let passcode = try? self.keychainService?.string(forKey: KeychainService.passcodeKeyPath),
           passcode == self.localPasscode {
          self.successPasscodeCircle()
        } else {
          self.localPasscode = ""
          self.decreaseAttempts()
          self.resetPassodeCircles()
        }
      }
    }
  }
  
  private func delete() {
    guard localPasscode.count > 0 else { return }
    passCodeCircles[localPasscode.count - 1].backgroundColor = Theme.currentTheme.color.bgTertiary
    localPasscode.removeLast()
  }
  
  private func biometric() {
    biometryService?.callBiometric { [weak self] success in
      if success {
        self?.complete()
      }
    }
  }
  
  private func decreaseAttempts() {
    guard var attemptsCount = userDefaultsService?.passCodeAttemptsCount,
          let blockTime = userDefaultsService?.passCodeBlockTime
    else { return }
    
    attemptsCount -= 1
    attemptsCount = max(0, attemptsCount)
    userDefaultsService?.passCodeAttemptsCount = attemptsCount
    
    if attemptsCount == 0 {
      userDefaultsService?.passCodeBlockDate = Calendar.current.date(byAdding: .minute, value: blockTime.rawValue, to: Date())
      userDefaultsService?.passCodeBlockTime = blockTime.next()
    }
    
    updateAttemptsState()
  }
  
  private func updateAttemptsState() {
    guard let attemptsCount = userDefaultsService?.passCodeAttemptsCount else { return }
    
    if attemptsCount == 0 {
      setupTimer()
      mainView.attemptsCountLabel.alpha = 0
    } else if attemptsCount < 3 {
      mainView.attemptsCountLabel.alpha = 1
    }
    
    mainView.attemptsCountLabel.text = R.string.passCode.attemptsRemaining("\(attemptsCount)")
    mainView.buttonsStack.alpha = CGFloat(attemptsCount)
  }
  
  private func setupTimer() {
    guard let blockDate = userDefaultsService?.passCodeBlockDate else { return }
    
    timer = Timer.scheduledTimer(withTimeInterval: 60.0, repeats: true) { [weak self] timer in
      let secondsLeft = Calendar.current.dateComponents([.second], from: Date(), to: blockDate).second ?? 0
      let minutesLeft = (Double(secondsLeft) / 60.0).rounded(.up)

      if minutesLeft > 0 {
        self?.mainView.titleLabel.text = R.string.passCode.tryAfter(number: Int(minutesLeft))
      } else {
        self?.mainView.titleLabel.text = R.string.passCode.enter()
        self?.userDefaultsService?.passCodeAttemptsCount = 1
        self?.updateAttemptsState()
      }
    }
    timer?.fire()
  }
  
  private func successPasscodeCircle() {
    Utils.impactSuccessFeedback()
    
    let group = DispatchGroup()
    passCodeCircles.forEach { circle in
      group.enter()
      circle.backgroundColor = Theme.currentTheme.color.acPositive
      circle.highlight { group.leave() }
    }
    
    group.notify(queue: .main) { [weak self] in
      self?.complete()
    }
  }
  
  private func resetPassodeCircles() {
    Utils.impactErrorFeedback()
    passCodeCircles.forEach { $0.backgroundColor = Theme.currentTheme.color.acNegative }
    mainView.deleteButton.alpha = 0
    
    Animations.shake(view: mainView.passCodeCircles) {
      UIView.animate(withDuration: 0.2, delay: 0.0, options: .curveEaseInOut) {
        self.passCodeCircles.forEach { $0.backgroundColor = Theme.currentTheme.color.bgTertiary }
      }
    }
  }
  
  private func complete() {
    uiService?.isAppUnlocked = true
    uiService?.openModule()
    
    userDefaultsService?.passCodeAttemptsCount = 3
    userDefaultsService?.passCodeBlockDate = nil
    userDefaultsService?.passCodeBlockTime = .minute1
  }
  
  @objc private func handleButton(_ sender: PassCodeButton) {
    sender.highlight()
    
    switch sender.type {
    case .number(let num): enterNum(num)
    case .delete: delete()
    case .biometric: biometric()
    }
    
    mainView.deleteButton.alpha = CGFloat(localPasscode.count)
  }
  
  @objc private func logOut() {
    try? keychainService?.deleteAll()
    userDefaultsService?.clear()
    
    uiService?.openModule()
  }
  
}
