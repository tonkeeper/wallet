import UIKit

extension Theme {
    
    static let changedNotification = NSNotification.Name("Theme.changed")
    
    @Autowired
    private static var defaultsService: UserDefaultsService

    static var currentTheme = Theme(rawValue: defaultsService.currentTheme) ?? .system {
        didSet {
            defaultsService.currentTheme = currentTheme.rawValue
            NotificationCenter.default.post(name: Theme.changedNotification, object: nil)
        }
    }
}
