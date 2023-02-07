import UIKit

extension UIButton {
    
    private func imageWithColor(color: UIColor) -> UIImage? {
        let rect = CGRect(origin: .zero, size: CGSize(width: 1.0, height: 1.0))
        UIGraphicsBeginImageContext(rect.size)
        let context = UIGraphicsGetCurrentContext()

        context?.setFillColor(color.cgColor)
        context?.fill(rect)

        let image = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()

        return image
    }

    func setBackgroundColor(_ color: UIColor?, for state: UIControl.State) {
        guard let color = color else {
            return
        }

        setBackgroundImage(imageWithColor(color: color), for: state)
    }
}
