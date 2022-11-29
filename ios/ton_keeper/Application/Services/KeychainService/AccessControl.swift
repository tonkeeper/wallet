import Security

enum AccessControl {
    case password
    case biometry
    
    func rawValue(accessibility: Accessibility) -> SecAccessControl? {
        switch self {
        case .password: return SecAccessControlCreateWithFlags(nil, accessibility.rawValue, .applicationPassword, nil)
        case .biometry: return SecAccessControlCreateWithFlags(nil, accessibility.rawValue, .biometryCurrentSet, nil)
        }
    }
}
