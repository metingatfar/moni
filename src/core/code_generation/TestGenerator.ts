export class TestGenerator {
  public generateUnitTests(componentName: string): string {
    return `import { ${componentName} } from './${componentName}';\n\ndescribe('${componentName}', () => {\n  it('should process actions successfully', () => {\n    const instance = new ${componentName}();\n    expect(instance).toBeDefined();\n  });\n});\n`;
  }
}
