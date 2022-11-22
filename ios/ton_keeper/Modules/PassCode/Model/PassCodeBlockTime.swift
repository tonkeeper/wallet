import Foundation

enum PassCodeBlockTime: Int, Codable, CaseIterable {
  case minute1 = 1
  case minute5 = 5
  case minute10 = 10
  case minute20 = 20
  case minute30 = 30
  case minute60 = 60
}
