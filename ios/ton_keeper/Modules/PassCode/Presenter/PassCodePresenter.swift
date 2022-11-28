import Foundation

protocol PassCodeViewOutput: AnyObject {
  var passCodeCount: Int { get }
  
  func viewIsReady()
  func enterNum(_ num: Int)
  func deleteNum()
  func biometric()
  func logOut()
  func close()
}

final class PassCodePresenter: NSObject {
  
  var didPasscodeEnter: ((String?) -> Void)? = nil
  weak var view: PassCodeViewInput?
  
  @Autowired private var keychainService: KeychainService?
  @Autowired private var biometryService: BiometryService?
  @Autowired private var uiService: UIService?
  @Autowired private var userDefaultsService: UserDefaultsService?
  
  private var localPasscode = ""
  private var timer: Timer?
  
  override init() {
    super.init()
    
    configure()
  }
  
  private func configure() {
    if let isFaceIdAvailable = biometryService?.isFaceIdAvailable {
      let image = isFaceIdAvailable ? R.image.passcodeFaceid() : R.image.passcodeTouchid()
      view?.setupBiometricButton(image: image, alpha: 1)
    } else {
      view?.setupBiometricButton(image: nil, alpha: 0)
    }
    
    updateAttemptsState()
  }
  
  private func updateAttemptsState() {
    guard let count = userDefaultsService?.passCodeAttemptsCount else { return }
    
    if count == 0 {
      setupTimer()
    }
    
    view?.updateAttempts(count: count)
  }
  
  private func complete() {
    if let didPasscodeEnter = didPasscodeEnter {
      didPasscodeEnter(localPasscode)
      close()
    } else {
      uiService?.isAppUnlocked = true
      uiService?.openModule()
    }
    
    userDefaultsService?.passCodeAttemptsCount = 3
    userDefaultsService?.passCodeBlockDate = nil
    userDefaultsService?.passCodeBlockTime = .minute1
  }
  
  private func setupTimer() {
    guard let blockDate = userDefaultsService?.passCodeBlockDate else { return }
    
    timer = Timer.scheduledTimer(withTimeInterval: 60.0, repeats: true) { [weak self] timer in
      let secondsLeft = Calendar.current.dateComponents([.second], from: Date(), to: blockDate).second ?? 0
      let minutesLeft = max(0, (Double(secondsLeft) / 60.0).rounded(.up))
      if minutesLeft == 0 {
        self?.userDefaultsService?.passCodeAttemptsCount = 1
        self?.updateAttemptsState()
      }
      
      self?.view?.updateBlockTime(minutesLeft: Int(minutesLeft))
    }
    timer?.fire()
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
  
}

// MARK: - PassCodeViewOutput
extension PassCodePresenter: PassCodeViewOutput {
  
  var passCodeCount: Int { localPasscode.count }
  
  func viewIsReady() {
    
  }
  
  func enterNum(_ num: Int) {
    localPasscode += "\(num)"
    
    if localPasscode.count >= 4 {
      if let passcode = try? keychainService?.string(forKey: KeychainService.passcodeKeyPath),
         passcode == localPasscode {
        view?.successPasscodeCircle { [weak self] in
          self?.complete()
        }
      } else {
        localPasscode = ""
        decreaseAttempts()
        view?.resetPassodeCircles()
      }
    }
  }
  
  func deleteNum() {
    guard localPasscode.count > 0 else { return }
    localPasscode.removeLast()
    view?.updateCircle(at: localPasscode.count, type: .empty)
  }
  
  func biometric() {
    biometryService?.callBiometric { [weak self] success in
      if success {
        self?.complete()
      }
    }
  }
  
  func logOut() {
    try? keychainService?.deleteAll()
    userDefaultsService?.clear()
    
    uiService?.openModule()
  }
  
  func close() {
    view?.close()
  }
  
}
