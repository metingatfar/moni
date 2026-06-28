export class CSharpGenerator {
  public generateCSharp(className: string): string {
    return `namespace App\n{\n    public class ${className}\n    {\n        public bool Process() => true;\n    }\n}\n`;
  }
}
