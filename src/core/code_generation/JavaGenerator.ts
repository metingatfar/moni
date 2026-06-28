export class JavaGenerator {
  public generateJava(className: string): string {
    return `public class ${className} {\n    public boolean process() {\n        return true;\n    }\n}\n`;
  }
}
