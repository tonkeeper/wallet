import Foundation

@propertyWrapper
struct UserDefaultWrapper<Value> where Value: Codable {
    let key: String
    let defaultValue: Value
    var container: UserDefaults = .standard

    var wrappedValue: Value {
        get {
            return (try? container.get(objectType: Value.self, forKey: key)) ?? defaultValue
        }
        set {
            try? container.set(object: newValue, forKey: key)
        }
    }
}
