export class FrameworkTemplateRegistry {
  private templates: Record<string, string[]> = {
    react: ['src/App.tsx', 'src/components/', 'package.json'],
    nextjs: ['app/page.tsx', 'app/layout.tsx', 'package.json'],
    vue: ['src/App.vue', 'src/components/', 'package.json'],
    angular: ['src/app/app.component.ts', 'src/app/app.module.ts', 'package.json'],
    svelte: ['src/App.svelte', 'package.json'],
    flutter: ['lib/main.dart', 'pubspec.yaml'],
    react_native: ['App.tsx', 'package.json'],
    swiftui: ['App.swift', 'ContentView.swift'],
    jetpack_compose: ['MainActivity.kt', 'build.gradle'],
    fastapi: ['main.py', 'requirements.txt'],
    django: ['manage.py', 'requirements.txt'],
    flask: ['app.py', 'requirements.txt'],
    express: ['index.js', 'package.json'],
    nestjs: ['src/main.ts', 'src/app.module.ts', 'package.json'],
    springboot: ['Application.java', 'pom.xml'],
    aspnet_core: ['Program.cs', 'Startup.cs', 'App.csproj'],
    go_fiber: ['main.go', 'go.mod'],
    rust_actix: ['src/main.rs', 'Cargo.toml'],
    electron: ['main.js', 'package.json'],
    tauri: ['src-tauri/src/main.rs', 'package.json']
  };

  public getFiles(fw: string): string[] {
    const key = fw.toLowerCase().replace(/[\.\s-]/g, '');
    return this.templates[key] || ['src/main.js'];
  }

  public getSupportedFrameworks(): string[] {
    return Object.keys(this.templates);
  }
}
export const frameworkTemplateRegistry = new FrameworkTemplateRegistry();
export default frameworkTemplateRegistry;
