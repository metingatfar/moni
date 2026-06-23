export interface ResourceMetrics {
  cpuUsage: number; // mock %
  ramUsageMs: number; // mock MB
  tokenRemaining: number;
  contextUsagePercent: number;
  cacheHitRate: number;
}

export class ExecutiveResourceManager {
  private metrics: ResourceMetrics = {
    cpuUsage: 12,
    ramUsageMs: 84,
    tokenRemaining: 100000,
    contextUsagePercent: 14,
    cacheHitRate: 85
  };

  public getMetrics(): ResourceMetrics {
    return { ...this.metrics };
  }

  public recordTokenUsage(tokens: number): void {
    this.metrics.tokenRemaining = Math.max(0, this.metrics.tokenRemaining - tokens);
  }

  public updateMetrics(updates: Partial<ResourceMetrics>): void {
    this.metrics = { ...this.metrics, ...updates };
  }
}
