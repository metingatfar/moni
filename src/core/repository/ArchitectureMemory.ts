export interface MemoryCacheData {
  architectureVersion: string;
  engineGraph: Record<string, string[]>;
  moduleGraph: Record<string, string[]>;
  repositoryFingerprint: string;
  lastScanTime: string;
  lastBuildStatus: string;
  cachedProjectTreeHash: string;
}

export class ArchitectureMemory {
  private cache: MemoryCacheData | null = null;

  public loadCache(): MemoryCacheData {
    if (this.cache) {
      return this.cache;
    }
    
    // Default mock data initialized on first load
    this.cache = {
      architectureVersion: 'EE-v4',
      engineGraph: {
        ExecutiveBrain: ['ReasoningEngine', 'PlanningEngine', 'ToolIntelligenceEngine', 'CognitiveLearningEngine', 'RepositoryIntelligenceEngine']
      },
      moduleGraph: {
        RepositoryIntelligenceEngine: ['RepositoryScanner', 'ProjectTree', 'ModuleIndexer', 'DependencyAnalyzer', 'RepositoryHealth', 'RepositoryStatistics', 'ArchitectureMemory']
      },
      repositoryFingerprint: 'mock-fingerprint-sprint-4.0-a',
      lastScanTime: new Date().toISOString(),
      lastBuildStatus: 'success',
      cachedProjectTreeHash: 'tree-hash-123456789'
    };
    return this.cache;
  }

  public saveCache(data: MemoryCacheData): void {
    this.cache = { ...data };
  }

  public getCacheStatus(): string {
    return this.cache ? 'Active' : 'Uninitialized';
  }
}

export const architectureMemory = new ArchitectureMemory();
export default architectureMemory;
