import UIKit

extension UIWindow {
  
  /// Transition Options
  struct TransitionOptions {
    
    /// Curve of animation
    ///
    /// - linear: linear
    /// - easeIn: ease in
    /// - easeOut: ease out
    /// - easeInOut: ease in - ease out
    public enum Curve {
      case linear
      case easeIn
      case easeOut
      case easeInOut
      
      /// Return the media timing function associated with curve
      internal var function: CAMediaTimingFunction {
        let key: String!
        switch self {
        case .linear: key = CAMediaTimingFunctionName.linear.rawValue
        case .easeIn: key = CAMediaTimingFunctionName.easeIn.rawValue
        case .easeOut: key = CAMediaTimingFunctionName.easeOut.rawValue
        case .easeInOut: key = CAMediaTimingFunctionName.easeInEaseOut.rawValue
        }
        return CAMediaTimingFunction(name: CAMediaTimingFunctionName(rawValue: key))
      }
    }
    
    /// Direction of the animation
    ///
    /// - fade: fade to new controller
    /// - toTop: slide from bottom to top
    /// - toBottom: slide from top to bottom
    /// - toLeft: pop to left
    /// - toRight: push to right
    public enum Direction {
      case fade
      case toTop
      case toBottom
      case toLeft
      case toRight
      
      /// Return the associated transition
      ///
      /// - Returns: transition
      internal func transition() -> CATransition {
        let transition = CATransition()
        transition.type = .push
        switch self {
        case .fade:
          transition.type = .fade
          transition.subtype = nil
        case .toLeft:
          transition.subtype = .fromLeft
        case .toRight:
          transition.subtype = .fromRight
        case .toTop:
          transition.subtype = .fromTop
        case .toBottom:
          transition.subtype = .fromBottom
        }
        return transition
      }
    }
    
    /// Background of the transition
    ///
    /// - solidColor: solid color
    /// - customView: custom view
    public enum Background {
      case solidColor(_: UIColor)
      case customView(_: UIView)
    }
    
    /// Duration of the animation (default is 0.20s)
    public var duration: TimeInterval = 0.20
    
    /// Direction of the transition (default is `toRight`)
    public var direction: TransitionOptions.Direction = .toRight
    
    /// Style of the transition (default is `linear`)
    public var style: TransitionOptions.Curve = .linear
    
    /// Background of the transition (default is `nil`)
    public var background: TransitionOptions.Background?
    
    /// Initialize a new options object with given direction and curve
    ///
    /// - Parameters:
    ///   - direction: direction
    ///   - style: style
    public init(direction: TransitionOptions.Direction = .toRight, style: TransitionOptions.Curve = .linear) {
      self.direction = direction
      self.style = style
    }
    
    public init() { }
    
    /// Return the animation to perform for given options object
    internal var animation: CATransition {
      let transition = self.direction.transition()
      transition.duration = self.duration
      transition.timingFunction = self.style.function
      return transition
    }
  }
  
  /// Change the root view controller of the window
  ///
  /// - Parameters:
  ///   - controller: controller to set
  ///   - options: options of the transition
  func setRootViewController(_ controller: UIViewController,
                             options: TransitionOptions = TransitionOptions()) {
    
    var transitionWnd: UIWindow?
    if let background = options.background {
      let window = UIWindow(frame: UIScreen.main.bounds)
      switch background {
      case .customView(let view):
        let viewController = UIViewController()
        view.frame = window.bounds
        viewController.view = view
        window.rootViewController = viewController
        
      case .solidColor(let color):
        window.backgroundColor = color
      }
      window.makeKeyAndVisible()
      transitionWnd = window
    }
    
    // Make animation
    self.layer.add(options.animation, forKey: kCATransition)
    self.rootViewController = controller
    self.makeKeyAndVisible()
    
    if let wnd = transitionWnd {
      DispatchQueue.main.asyncAfter(deadline: (.now() + 1 + options.duration), execute: {
        wnd.removeFromSuperview()
      })
    }
  }
}
