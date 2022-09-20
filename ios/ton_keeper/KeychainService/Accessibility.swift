import Security

enum Accessibility: RawRepresentable {
    case whenUnlocked
    case whenUnlockedThisDeviceOnly
    case afterFirstUnlock
    case afterFirstUnlockThisDeviceOnly
    case whenPasscodeSetThisDeviceOnly

    init(rawValue: CFString) {
        switch rawValue {
        case kSecAttrAccessibleWhenUnlocked: self = .whenUnlocked
        case kSecAttrAccessibleWhenUnlockedThisDeviceOnly: self = .whenUnlockedThisDeviceOnly
        case kSecAttrAccessibleAfterFirstUnlock: self = .afterFirstUnlock
        case kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly: self = .afterFirstUnlockThisDeviceOnly
        case kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly: self = .whenPasscodeSetThisDeviceOnly
        default: self = .afterFirstUnlock
        }
    }

    var rawValue: CFString {
        switch self {
        case .whenUnlocked: return kSecAttrAccessibleWhenUnlocked
        case .whenUnlockedThisDeviceOnly: return kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        case .afterFirstUnlock: return kSecAttrAccessibleAfterFirstUnlock
        case .afterFirstUnlockThisDeviceOnly: return kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        case .whenPasscodeSetThisDeviceOnly: return kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly
        }
    }
}
