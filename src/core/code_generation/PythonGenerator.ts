export class PythonGenerator {
  public generatePython(moduleName: string): string {
    return `class ${moduleName}:\n    def __init__(self):\n        pass\n\n    def process_data(self):\n        return True\n`;
  }
}
