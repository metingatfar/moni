export class DependencyResolver {
  private deps: Record<string, string[]> = {
    npm: ['react', 'react-dom', 'typescript', 'vite', 'jest'],
    pnpm: ['react', 'react-dom', 'typescript', 'vite', 'vitest'],
    yarn: ['react', 'react-dom', 'typescript', 'webpack'],
    pip: ['fastapi', 'uvicorn', 'pydantic', 'pytest', 'black'],
    poetry: ['fastapi', 'uvicorn', 'pytest'],
    cargo: ['tokio', 'serde', 'serde_json', 'actix-web'],
    gradle: ['kotlin-stdlib', 'androidx.compose.ui:ui'],
    maven: ['spring-boot-starter-web', 'spring-boot-starter-test'],
    pub: ['flutter', 'flutter_test', 'riverpod', 'path_provider'],
    nuget: ['Microsoft.AspNetCore.OpenApi', 'Microsoft.NET.Test.Sdk']
  };

  public resolveDependencies(packageManager: string): string[] {
    return this.deps[packageManager.toLowerCase()] || ['lodash'];
  }
}
export const dependencyResolver = new DependencyResolver();
export default dependencyResolver;
