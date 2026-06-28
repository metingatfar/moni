import { container } from '../container/ServiceContainer';

export class FrameworkDetector {
  public detectFramework(): string {
    // Read repo context if available to check dependencies
    try {
      const repoIntel = container.resolve<any>('RepositoryIntelligenceEngine');
      if (repoIntel) {
        const repoCtx = repoIntel.getRepositoryContext();
        const structure = repoCtx.cache.structure || {};
        
        // Check for indicators in repository scanning records
        const fileNames = structure.files || [];
        
        if (fileNames.includes('vite.config.ts') || fileNames.includes('vite.config.js')) {
          return 'Vite (React)';
        }
        if (fileNames.includes('next.config.js') || fileNames.includes('next.config.mjs')) {
          return 'Next.js';
        }
        if (fileNames.includes('pubspec.yaml')) {
          return 'Flutter';
        }
      }
    } catch (_) {}
    
    // Default fallback based on standard repository details
    return 'Vite (React)';
  }
}

export const frameworkDetector = new FrameworkDetector();
export default frameworkDetector;
