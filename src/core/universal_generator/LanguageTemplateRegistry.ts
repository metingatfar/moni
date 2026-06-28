export class LanguageTemplateRegistry {
  private templates: Record<string, string> = {
    typescript: 'export class {name} {\n  constructor() {}\n}',
    javascript: 'export class {name} {\n  constructor() {}\n}',
    python: 'class {name}:\n    def __init__(self):\n        pass',
    dart: 'class {name} {\n  {name}();\n}',
    kotlin: 'class {name} {\n}',
    swift: 'class {name} {\n}',
    csharp: 'namespace {projectName}\n{\n    public class {name}\n    {\n    }\n}',
    java: 'public class {name} {\n}',
    go: 'package main\n\ntype {name} struct {\n}',
    rust: 'pub struct {name} {\n}',
    php: 'class {name} {\n}',
    cpp: 'class {name} {\n};',
    zig: 'const std = @import("std");\n\npub const {name} = struct {\n};'
  };

  public getTemplate(lang: string, name: string, projectName: string = 'App'): string {
    const raw = this.templates[lang.toLowerCase()] || 'class {name} {}';
    return raw.replace(/{name}/g, name).replace(/{projectName}/g, projectName);
  }

  public getSupportedLanguages(): string[] {
    return Object.keys(this.templates);
  }
}
export const languageTemplateRegistry = new LanguageTemplateRegistry();
export default languageTemplateRegistry;
