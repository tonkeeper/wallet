import Foundation

@propertyWrapper
struct Autowired<T> {

    init() {
        if T.self is ExpressibleByNilLiteral.Type {
            // swiftlint:disable force_cast
            let value: T! = ServiceLocator.getAny()
            self.wrappedValue = value ?? (Optional<Any>.none as! T)
            // swiftlint:enable force_cast
        } else if let value: T = ServiceLocator.getService() {
            self.wrappedValue = value
        } else if let value: T = ServiceLocator.getAny() {
            self.wrappedValue = value
        } else {
            fatalError("Service \(T.self) is not registered")
        }
    }
    
    let wrappedValue: T
}
