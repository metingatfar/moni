export class CodeConventionEngine {
  private rules: Record<string, string[]> = {
    pep8: ['Use 4 spaces per indentation level.', 'Limit all lines to a maximum of 79 characters.'],
    airbnb: ['Use 2 spaces for indentation.', 'Prefer const over let for variable declaration.'],
    google_style: ['Use 2 spaces for indentation.', 'Namespaces are forbidden.'],
    microsoft_style: ['Use PascalCase for public members.', 'Use camelCase for method arguments.'],
    flutter_lints: ['Prefer const constructors when possible.', 'Always specify types.'],
    rustfmt: ['Use 4 spaces for indentation.', 'Group imports logically.']
  };

  public getRules(convention: string): string[] {
    const key = convention.toLowerCase().replace(/[\s-]/g, '_');
    return this.rules[key] || ['Use consistent formatting.'];
  }
}
export const codeConventionEngine = new CodeConventionEngine();
export default codeConventionEngine;
