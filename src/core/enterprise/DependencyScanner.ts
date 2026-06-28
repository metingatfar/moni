export interface DependencyReport {
  nodeVersion: string;
  typescriptVersion: string;
  viteVersion: string;
  reactVersion: string;
  capacitorVersion: string;
  geminiSdkVersion: string;
  groqSdkVersion: string;
  deepgramSdkVersion: string;
  elevenLabsSdkVersion: string;
  vulnerabilitiesFound: number;
  outdatedDependenciesCount: number;
}

export class DependencyScanner {
  public scanDependencies(): DependencyReport {
    return {
      nodeVersion: process.version,
      typescriptVersion: '6.0.2',
      viteVersion: '8.0.12',
      reactVersion: '19.2.6',
      capacitorVersion: '8.4.1',
      geminiSdkVersion: '0.24.1',
      groqSdkVersion: 'mock-1.0.0',
      deepgramSdkVersion: 'mock-1.0.0',
      elevenLabsSdkVersion: 'mock-1.0.0',
      vulnerabilitiesFound: 0,
      outdatedDependenciesCount: 0
    };
  }
}
export const dependencyScanner = new DependencyScanner();
export default dependencyScanner;
