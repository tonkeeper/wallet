import UIKit

class BaseButton: UIButton, ThemeStyled {

    var touchMinSize = CGSize(width: 44, height: 44)
    var touchInsets: UIEdgeInsets = .zero

    override init(frame: CGRect) {
        super.init(frame: frame)
        initSetup()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }

    override func awakeFromNib() {
        super.awakeFromNib()

        setTitle(nil, for: .normal)
        setAttributedTitle(nil, for: .normal)

        initSetup()
    }

    override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
        var touchBounds = bounds.inset(by: touchInsets)
        let minInsets = CGSize(width: min(touchBounds.width - touchMinSize.width, 0),
                               height: min(touchBounds.height - touchMinSize.height, 0))
        if minInsets != .zero {
            touchBounds = bounds.insetBy(dx: minInsets.width, dy: minInsets.height)
        }
        return touchBounds.contains(point)
    }

    func initSetup() {
        adjustsImageWhenDisabled = false
        adjustsImageWhenHighlighted = false

        updateTheme()
        NotificationCenter.default.addObserver(self, selector: #selector(themeDidChanged),
                                               name: Theme.changedNotification, object: nil)
    }

    func updateTheme() {}

    @objc
    private func themeDidChanged(_ notification: Notification) {
        updateTheme()
    }
}
