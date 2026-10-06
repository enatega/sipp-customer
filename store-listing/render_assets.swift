import CoreGraphics
import CoreText
import Foundation
import ImageIO
import UniformTypeIdentifiers

func loadImage(_ path: String) -> CGImage? {
    guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil) else { return nil }
    return CGImageSourceCreateImageAtIndex(source, 0, nil)
}

func bitmap(width: Int, height: Int) -> CGContext? {
    CGContext(
        data: nil,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    )
}

func writeImage(_ image: CGImage, to path: String, type: UTType) {
    guard let destination = CGImageDestinationCreateWithURL(URL(fileURLWithPath: path) as CFURL, type.identifier as CFString, 1, nil) else {
        fatalError("Could not open output: \(path)")
    }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else { fatalError("Could not write: \(path)") }
}

func drawLine(_ text: String, x: CGFloat, y: CGFloat, size: CGFloat, color: CGColor, in context: CGContext) {
    let attributes: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(rawValue: kCTFontAttributeName as String): CTFontCreateWithName("HelveticaNeue-Bold" as CFString, size, nil),
        NSAttributedString.Key(rawValue: kCTForegroundColorAttributeName as String): color,
    ]
    let line = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: attributes))
    context.textPosition = CGPoint(x: x, y: y)
    CTLineDraw(line, context)
}

guard CommandLine.arguments.count == 5,
      let icon = loadImage(CommandLine.arguments[1]),
      let feature = loadImage(CommandLine.arguments[2]),
      let iconContext = bitmap(width: 512, height: 512),
      let featureContext = bitmap(width: 1024, height: 500) else {
    fputs("Usage: swift render_assets.swift ICON_SOURCE FEATURE_SOURCE ICON_OUTPUT FEATURE_OUTPUT\n", stderr)
    exit(1)
}

iconContext.interpolationQuality = .high
iconContext.draw(icon, in: CGRect(x: 0, y: 0, width: 512, height: 512))
writeImage(iconContext.makeImage()!, to: CommandLine.arguments[3], type: .png)

featureContext.interpolationQuality = .high
featureContext.draw(feature, in: CGRect(x: 0, y: 0, width: 1024, height: 500))
let navy = CGColor(colorSpace: CGColorSpaceCreateDeviceRGB(), components: [0.05, 0.12, 0.23, 1])!
let blue = CGColor(colorSpace: CGColorSpaceCreateDeviceRGB(), components: [0.11, 0.61, 0.93, 1])!
drawLine("Sipp", x: 65, y: 357, size: 36, color: blue, in: featureContext)
drawLine("Local favourites,", x: 65, y: 260, size: 52, color: navy, in: featureContext)
drawLine("delivered.", x: 65, y: 192, size: 52, color: navy, in: featureContext)
writeImage(featureContext.makeImage()!, to: CommandLine.arguments[4], type: .jpeg)
