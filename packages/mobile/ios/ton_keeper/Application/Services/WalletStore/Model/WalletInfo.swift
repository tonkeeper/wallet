import Foundation

typealias PublicKey = String
typealias SecretKey = String

class WalletInfo: Codable, JSONAble {
  let pubkey: PublicKey
  var label: String
  
  init(pubkey: PublicKey, label: String) {
    self.pubkey = pubkey
    self.label = label
  }
}

extension WalletInfo: Equatable {
  static func == (lhs: WalletInfo, rhs: WalletInfo) -> Bool {
    return lhs.pubkey == rhs.pubkey && lhs.label == rhs.label
  }
}

extension WalletInfo: Hashable {
  func hash(into hasher: inout Hasher) {
    hasher.combine(pubkey)
    hasher.combine(label)
  }
}
