export class StaticAnalysisGenerator {
  public generateLinterRules(): string {
    return `{\n  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],\n  "rules": {\n    "@typescript-eslint/no-explicit-any": "error"\n  }\n}\n`;
  }
}
