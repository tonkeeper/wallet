import Foundation

struct AppError: Error, LocalizedError {
  var code: String
  var isRemote: Bool
  var statusCode: Int?
  var userInfo: [String: Any]
  let message: String?
  var errorDescription: String?
  let file: StaticString
  let function: StaticString
  let line: UInt
  let defaultMessage: String?
  
  init(_ code: String,
       isRemote: Bool = false,
       statusCode: Int? = nil,
       userInfo: [String: Any] = [:],
       message: String? = nil,
       errorDescription: String? = nil,
       file: StaticString = #file,
       function: StaticString = #function,
       line: UInt = #line,
       defaultMessage: String? = nil) {
    self.code = code
    self.isRemote = isRemote
    self.statusCode = statusCode
    self.userInfo = userInfo
    self.message = message
    self.errorDescription = errorDescription
    self.file = file
    self.function = function
    self.line = line
    self.defaultMessage = defaultMessage
  }
  
}
