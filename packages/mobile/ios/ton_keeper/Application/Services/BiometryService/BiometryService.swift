import Foundation
import LocalAuthentication

final class BiometryService {
  
  var isFaceIdAvailable: Bool? {
    let context = LAContext()
    var error: NSError?
    if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
      return context.biometryType == .faceID
    }
    
    return nil
  }
  
  func callBiometric(completion: @escaping (Bool) -> Void) {
    guard let isFaceIdAvailable = isFaceIdAvailable else { return }
    let context = LAContext()
    context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,
                           localizedReason: isFaceIdAvailable ? "Face ID" : "Touch ID",
                           reply: { success, error in
      DispatchQueue.main.async {
        completion(success)
      }
    })
  }
  
}
