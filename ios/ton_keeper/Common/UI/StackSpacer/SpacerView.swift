import UIKit

class SpacerView: BaseView {
    
    convenience init(minHeight: CGFloat) {
        self.init(frame: .zero)
        heightConstraint?.constant = minHeight
    }
    
    convenience init(minWidth: CGFloat) {
        self.init()
        widthConstraint?.constant = minWidth
    }
    
    var minHeight: CGFloat = 0 {
        didSet {
            heightConstraint?.constant = minHeight
        }
    }
    
    var minWidth: CGFloat = 0 {
        didSet {
            widthConstraint?.constant = minWidth
        }
    }
    
    private var heightConstraint: NSLayoutConstraint!
    private var widthConstraint: NSLayoutConstraint!
    
    override func initSetup() {
        
        widthConstraint = widthAnchor.constraint(greaterThanOrEqualToConstant: minWidth)
        heightConstraint = heightAnchor.constraint(greaterThanOrEqualToConstant: minHeight)
        
        NSLayoutConstraint.activate([
            heightConstraint,
            widthConstraint
        ])
        
        backgroundColor = .clear
        setContentHuggingPriority(.init(0), for: .horizontal)
        setContentHuggingPriority(.init(0), for: .vertical)
        
        setContentCompressionResistancePriority(.init(0), for: .horizontal)
        setContentCompressionResistancePriority(.init(0), for: .vertical)
    }
    
    override var intrinsicContentSize: CGSize { .init(side: UIView.noIntrinsicMetric) }
}
