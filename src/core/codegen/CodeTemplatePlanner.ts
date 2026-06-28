export class CodeTemplatePlanner {
  public planTemplate(templateName: string): string {
    switch (templateName) {
      case 'service':
        return `export class NewService {\n  public execute(): void {}\n}`;
      case 'interface':
        return `export interface NewInterface {\n  execute(): void;\n}`;
      case 'dashboard':
        return `export const NewPanel: React.FC = () => {\n  return <div>Panel</div>;\n};`;
      case 'test':
        return `import { assert } from 'console';\ndescribe('test', () => {});`;
      case 'report':
        return `# Report Title\n* Metric: value`;
      default:
        return `// Template placeholder`;
    }
  }
}

export const codeTemplatePlanner = new CodeTemplatePlanner();
export default codeTemplatePlanner;
