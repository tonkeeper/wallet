import Foundation

typealias WalletID = String
typealias PublicKey = String

class WalletInfo: Codable, JSONAble {
  let id: WalletID
  let pubkey: PublicKey
  var label: String
  
  init(id: WalletID, pubkey: PublicKey, label: String) {
    self.id = id
    self.pubkey = pubkey
    self.label = label
  }
}
