import UIKit

extension UIStackView {
    
    convenience init(views: [UIView],
                     axis: NSLayoutConstraint.Axis = .vertical,
                     spacing: CGFloat = 0,
                     alignment: Alignment = .fill,
                     distribution: Distribution = .fill) {
        self.init(arrangedSubviews: views)
        self.axis = axis
        self.spacing = spacing
        self.distribution = distribution
        self.alignment = alignment
    }
    
}
