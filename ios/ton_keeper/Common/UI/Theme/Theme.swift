import UIKit

enum Theme: Int {
    
    case light, dark, system

    var color: ColorTheme {
        switch realColorTheme {
        case .light:
            return LightColorTheme()
        case .dark:
            return DarkColorTheme()
        case .system:
            return systemColorTheme == .light ? LightColorTheme() : DarkColorTheme()
        }
    }

    var statusBarStyle: UIStatusBarStyle {
        if #available(iOS 13.0, *) {
            return realColorTheme == .light  ? .darkContent : .lightContent
        } else {
            return realColorTheme == .light  ? .default : .lightContent
        }
    }

}

extension Theme {
    private var realColorTheme: Theme {
        if self == .system {
            return systemColorTheme
        } else {
            return self
        }
    }
    
    private var systemColorTheme: Theme {
        guard #available(iOS 13.0, *) else { return .light }
        return UITraitCollection.current.userInterfaceStyle == .dark ? .dark : .light
    }
}
