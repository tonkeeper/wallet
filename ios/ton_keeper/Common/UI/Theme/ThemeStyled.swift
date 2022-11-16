import Foundation

protocol ThemeStyled {
    var theme: Theme { get }
}

extension ThemeStyled {
    var theme: Theme { Theme.currentTheme }
}
