import Foundation
import UIKit

class EmitterView: UIView {
  
  override class var layerClass: AnyClass {
    CAEmitterLayer.self
  }
  
  override var layer: CAEmitterLayer {
    return super.layer as! CAEmitterLayer
  }
  
  @objc var isOn: Bool = false {
    didSet {
      self.layer.birthRate = isOn ? 1 : 0
    }
  }
  
  @objc var color: String = "#000000" {
    didSet {
      self.updateEmitterCell()
    }
  }
  
  override func layoutSubviews() {
    super.layoutSubviews()
    layer.emitterPosition = CGPoint(x: bounds.size.width / 2, y: bounds.size.height / 2)
    layer.emitterSize = bounds.size
    layer.emitterShape = .rectangle
    
    updateEmitterCell()
  }
  
  func updateEmitterCell() {
    let emitterCell = CAEmitterCell()
    emitterCell.contents = UIImage(named: "textSpeckle_Normal")?.cgImage
    emitterCell.color = UIColor(hex: color).withAlphaComponent(0.5).cgColor
    emitterCell.contentsScale = 1.8
    emitterCell.emissionRange = CGFloat.pi * 2
    emitterCell.lifetime = 1
    emitterCell.scale = 0.5
    emitterCell.velocityRange = 20
    emitterCell.alphaRange = 1
    emitterCell.birthRate = Float(bounds.size.width * bounds.size.height / 3)
    
    layer.emitterCells = [emitterCell]
  }
}


@objc(SpoilerViewManager)
class SpoilerViewManager: RCTViewManager {
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    return EmitterView()
  }
}
