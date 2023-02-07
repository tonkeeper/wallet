protocol JSONAble {}

extension JSONAble {
  func toDict() -> [String:Any] {
    var dict: [String:Any] = [:]
    for child in Mirror(reflecting: self).children {
      if let key = child.label {
        dict[key] = child.value
      }
    }
    
    return dict
  }
}
