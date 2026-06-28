import { AIProviderPool } from './AIProviderPool';
import { TokenBudgetMonitor } from './TokenBudgetMonitor';
import { CreditMonitor } from './CreditMonitor';
import { ModelSwitchEngine } from './ModelSwitchEngine';
import { CheckpointManager } from './CheckpointManager';
import { ResumeEngine } from './ResumeEngine';
import { TaskChunker } from './TaskChunker';
import { PromptCache } from './PromptCache';
import { CostOptimizer } from './CostOptimizer';

export interface ResourcePlanPackage {
  success: boolean;
  selectedProvider: string;
  nextFallbackProvider: string;
  estimatedTokensCost: number;
  totalRemainingTokens: number;
  totalRemainingCredits: number;
  cacheHitRate: number;
  chunksCount: number;
  checkpointId?: string;
  resumed: boolean;
}

export class ResourceManager {
  private providerPool = new AIProviderPool();
  private tokenBudgetMonitor = new TokenBudgetMonitor();
  private creditMonitor = new CreditMonitor();
  private modelSwitchEngine = new ModelSwitchEngine();
  private checkpointManager = new CheckpointManager();
  private resumeEngine = new ResumeEngine();
  private taskChunker = new TaskChunker();
  private promptCache = new PromptCache();
  private costOptimizer = new CostOptimizer();

  // Diagnostics
  private requestCount = 0;
  private switchCount = 0;
  private checkpointCount = 0;
  private resumeCount = 0;

  public executeRequest(request: string): ResourcePlanPackage {
    this.requestCount++;
    
    // 1. Budget Check & Provider Selection
    const activeProviders = this.providerPool.getActiveProviders();
    const selected = this.costOptimizer.selectBestProvider(activeProviders, { maxCost: 12.0, minLatencyMs: 100 });
    
    // 2. Chunker
    const chunks = this.taskChunker.chunkRequest(request);
    const estimatedCost = chunks.reduce((acc, c) => acc + c.estimatedTokens, 0);

    // 3. spend tokens & credits
    this.tokenBudgetMonitor.spendTokens(estimatedCost);
    const usdSpent = (estimatedCost / 1000000) * selected.costPerMillionTokens;
    this.creditMonitor.spendCredits(usdSpent);

    // 4. Fallback switch check
    const nextFallbackProvider = this.modelSwitchEngine.determineAlternativeProvider(selected.id, this.tokenBudgetMonitor.getRemaining());
    if (nextFallbackProvider !== selected.id) {
      this.switchCount++;
    }

    // 5. Checkpoint
    const cp = this.checkpointManager.saveCheckpoint('Resource Optimization Stage', { request, selected: selected.id });
    this.checkpointCount++;

    // 6. Resume check
    const resumeStatus = this.resumeEngine.resumeFromCheckpoint(cp);
    this.resumeCount++;

    // 7. Prompt Cache
    this.promptCache.set(request, 'Executed design skeleton task.', estimatedCost);

    return {
      success: true,
      selectedProvider: selected.name,
      nextFallbackProvider,
      estimatedTokensCost: estimatedCost,
      totalRemainingTokens: this.tokenBudgetMonitor.getRemaining(),
      totalRemainingCredits: this.creditMonitor.getBalance(),
      cacheHitRate: this.promptCache.getHitRate(),
      chunksCount: chunks.length,
      checkpointId: cp.id,
      resumed: resumeStatus.success
    };
  }

  public getDiagnostics() {
    return {
      requestCount: this.requestCount,
      switchCount: this.switchCount,
      checkpointCount: this.checkpointCount,
      resumeCount: this.resumeCount,
      remainingTokens: this.tokenBudgetMonitor.getRemaining(),
      remainingCredits: this.creditMonitor.getBalance()
    };
  }

  public getPool() {
    return this.providerPool;
  }

  public getBudget() {
    return this.tokenBudgetMonitor;
  }

  public getCredits() {
    return this.creditMonitor;
  }

  public getCache() {
    return this.promptCache;
  }

  public clear(): void {
    this.requestCount = 0;
    this.switchCount = 0;
    this.checkpointCount = 0;
    this.resumeCount = 0;
    this.checkpointManager.clear();
    this.resumeEngine.reset();
    this.promptCache.clear();
  }
}

export const resourceManager = new ResourceManager();
export default resourceManager;
