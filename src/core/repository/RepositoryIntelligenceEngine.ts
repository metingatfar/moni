import { repositoryScanner } from './RepositoryScanner';
import type { RepositoryScanResult } from './RepositoryScanner';
import { projectTree } from './ProjectTree';
import { moduleIndexer } from './ModuleIndexer';
import type { IndexedModule } from './ModuleIndexer';
import { dependencyAnalyzer } from './DependencyAnalyzer';
import type { DependencyMapping } from './DependencyAnalyzer';
import { repositoryHealth } from './RepositoryHealth';
import type { HealthStatus } from './RepositoryHealth';
import { repositoryStatistics } from './RepositoryStatistics';
import type { FileStats } from './RepositoryStatistics';
import { architectureMemory } from './ArchitectureMemory';
import type { MemoryCacheData } from './ArchitectureMemory';

export interface RepositoryContext {
  scanResult: RepositoryScanResult;
  treeString: string;
  indexedModules: IndexedModule[];
  dependencies: DependencyMapping[];
  healthStatus: HealthStatus;
  stats: FileStats;
  cache: MemoryCacheData;
}

export class RepositoryIntelligenceEngine {
  public getRepositoryContext(): RepositoryContext {
    const scanResult = repositoryScanner.scanRepository();
    const treeString = projectTree.generateTree(scanResult.folders);
    const indexedModules = moduleIndexer.getModules();
    const dependencies = dependencyAnalyzer.analyzeDependencies();
    const healthStatus = repositoryHealth.checkHealth();
    const stats = repositoryStatistics.computeStats(scanResult);
    const cache = architectureMemory.loadCache();

    return {
      scanResult,
      treeString,
      indexedModules,
      dependencies,
      healthStatus,
      stats,
      cache
    };
  }

  public getDiagnostics() {
    const ctx = this.getRepositoryContext();
    return {
      repositorySize: ctx.stats.totalFiles,
      totalModules: ctx.indexedModules.length,
      indexedEngines: ctx.scanResult.engines.length,
      indexedServices: ctx.indexedModules.filter(m => m.type === 'Service').length,
      cachedArchitecture: ctx.cache.architectureVersion,
      repositoryScanTime: ctx.scanResult.scanTimeMs,
      architectureCacheHash: ctx.cache.cachedProjectTreeHash
    };
  }
}

export const repositoryIntelligenceEngine = new RepositoryIntelligenceEngine();
export default repositoryIntelligenceEngine;
