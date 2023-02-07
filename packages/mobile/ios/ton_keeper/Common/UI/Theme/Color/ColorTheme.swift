import UIKit

protocol ColorTheme {
    var fgPrimary: UIColor { get }
    var fgSecondary: UIColor { get }
    var fgTertiary: UIColor { get }
    var bgPrimaryTrans: UIColor { get }
    var bgPrimary: UIColor { get }
    var bgSecondary: UIColor { get }
    var bgTertiary: UIColor { get }
    var bgQuaternary: UIColor { get }
    var acPrimary: UIColor { get }
    var acPositive: UIColor { get }
    var acNegative: UIColor { get }
    var acPurple: UIColor { get }
    var acOrange: UIColor { get }
    var ct: UIColor { get }
    var otOverlayStrong: UIColor { get }
    var otOverlay: UIColor { get }
    var otBorder: UIColor { get }
    var systemColorsBlue: UIColor { get }
    var systemColorsRed: UIColor { get }
}

struct LightColorTheme: ColorTheme {
    let fgPrimary =  #colorLiteral(red: 1, green: 1, blue: 1, alpha: 1)
    let fgSecondary =  #colorLiteral(red: 0.5375999808311462, green: 0.5785599946975708, blue: 0.6399999856948853, alpha: 1)
    let fgTertiary =  #colorLiteral(red: 0.3333333432674408, green: 0.3803921639919281, blue: 0.43921568989753723, alpha: 1)
    let bgPrimaryTrans =  #colorLiteral(red: 0.06239999830722809, green: 0.08543998748064041, blue: 0.11999999731779099, alpha: 0.9200000166893005)
    let bgPrimary =  #colorLiteral(red: 0.06240000203251839, green: 0.08543999493122101, blue: 0.12000000476837158, alpha: 1)
    let bgSecondary =  #colorLiteral(red: 0.1120000034570694, green: 0.14719998836517334, blue: 0.20000000298023224, alpha: 1)
    let bgTertiary =  #colorLiteral(red: 0.17919999361038208, green: 0.2195199877023697, blue: 0.2800000011920929, alpha: 1)
    let bgQuaternary =  #colorLiteral(red: 0.24480000138282776, green: 0.2908799946308136, blue: 0.36000001430511475, alpha: 1)
    let acPrimary =  #colorLiteral(red: 0.26879996061325073, green: 0.6835198998451233, blue: 0.9599999785423279, alpha: 1)
    let acPositive =  #colorLiteral(red: 0.2239999771118164, green: 0.800000011920929, blue: 0.5119999647140503, alpha: 1)
    let acNegative =  #colorLiteral(red: 1, green: 0.2799999713897705, blue: 0.4000002145767212, alpha: 1)
    let acPurple =  #colorLiteral(red: 0.46300649642944336, green: 0.3960784673690796, blue: 0.8980392217636108, alpha: 1)
    let acOrange =  #colorLiteral(red: 0.9599999785423279, green: 0.6560001373291016, blue: 0.23040002584457397, alpha: 1)
    let ct =  #colorLiteral(red: 1, green: 1, blue: 1, alpha: 1)
    let otOverlayStrong =  #colorLiteral(red: 0, green: 0, blue: 0, alpha: 0.7200000286102295)
    let otOverlay =  #colorLiteral(red: 0, green: 0, blue: 0, alpha: 0.47999998927116394)
    let otBorder =  #colorLiteral(red: 1, green: 1, blue: 1, alpha: 0.07999999821186066)
    let systemColorsBlue =  #colorLiteral(red: 0, green: 0.46666666865348816, blue: 1, alpha: 1)
    let systemColorsRed =  #colorLiteral(red: 1, green: 0.23137255012989044, blue: 0.1882352977991104, alpha: 1)
}

struct DarkColorTheme: ColorTheme {
    let fgPrimary =  #colorLiteral(red: 1, green: 1, blue: 1, alpha: 1)
    let fgSecondary =  #colorLiteral(red: 0.5375999808311462, green: 0.5785599946975708, blue: 0.6399999856948853, alpha: 1)
    let fgTertiary =  #colorLiteral(red: 0.3333333432674408, green: 0.3803921639919281, blue: 0.43921568989753723, alpha: 1)
    let bgPrimaryTrans =  #colorLiteral(red: 0.06239999830722809, green: 0.08543998748064041, blue: 0.11999999731779099, alpha: 0.9200000166893005)
    let bgPrimary =  #colorLiteral(red: 0.06240000203251839, green: 0.08543999493122101, blue: 0.12000000476837158, alpha: 1)
    let bgSecondary =  #colorLiteral(red: 0.1120000034570694, green: 0.14719998836517334, blue: 0.20000000298023224, alpha: 1)
    let bgTertiary =  #colorLiteral(red: 0.17919999361038208, green: 0.2195199877023697, blue: 0.2800000011920929, alpha: 1)
    let bgQuaternary =  #colorLiteral(red: 0.24480000138282776, green: 0.2908799946308136, blue: 0.36000001430511475, alpha: 1)
    let acPrimary =  #colorLiteral(red: 0.26879996061325073, green: 0.6835198998451233, blue: 0.9599999785423279, alpha: 1)
    let acPositive =  #colorLiteral(red: 0.2239999771118164, green: 0.800000011920929, blue: 0.5119999647140503, alpha: 1)
    let acNegative =  #colorLiteral(red: 1, green: 0.2799999713897705, blue: 0.4000002145767212, alpha: 1)
    let acPurple =  #colorLiteral(red: 0.46300649642944336, green: 0.3960784673690796, blue: 0.8980392217636108, alpha: 1)
    let acOrange =  #colorLiteral(red: 0.9599999785423279, green: 0.6560001373291016, blue: 0.23040002584457397, alpha: 1)
    let ct =  #colorLiteral(red: 0, green: 0, blue: 0, alpha: 1)
    let otOverlayStrong =  #colorLiteral(red: 0, green: 0, blue: 0, alpha: 0.7200000286102295)
    let otOverlay =  #colorLiteral(red: 0, green: 0, blue: 0, alpha: 0.47999998927116394)
    let otBorder =  #colorLiteral(red: 1, green: 1, blue: 1, alpha: 0.07999999821186066)
    let systemColorsBlue =  #colorLiteral(red: 0, green: 0.46666666865348816, blue: 1, alpha: 1)
    let systemColorsRed =  #colorLiteral(red: 1, green: 0.23137255012989044, blue: 0.1882352977991104, alpha: 1)
}
