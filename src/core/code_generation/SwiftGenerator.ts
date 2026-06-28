export class SwiftGenerator {
  public generateSwift(className: string): string {
    return `import Foundation\n\nclass ${className} {\n    func process() -> Bool {\n        return true\n    }\n}\n`;
  }
}
