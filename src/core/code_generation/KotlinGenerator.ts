export class KotlinGenerator {
  public generateKotlin(className: string): string {
    return `class ${className} {\n    fun process(): Boolean {\n        return true\n    }\n}\n`;
  }
}
