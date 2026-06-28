export class DocumentationGenerator {
  public generateDocs(projectName: string, modules: string[]): string {
    return `# ${projectName} API Documentation\n\n## Modules\n${modules.map(m => `- **${m}**: Service functionality description`).join('\n')}\n`;
  }
}
