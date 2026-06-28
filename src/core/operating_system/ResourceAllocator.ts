export interface ResourceAllocation {
  cpuUsagePercent: number;
  memoryUsageMB: number;
  tokensConsumed: number;
  maxParallelLimit: number;
  activeProvider: string;
}

export class ResourceAllocator {
  private resources: ResourceAllocation = {
    cpuUsagePercent: 12,
    memoryUsageMB: 180,
    tokensConsumed: 0,
    maxParallelLimit: 4,
    activeProvider: 'Google Gemini'
  };

  private tokenBudgetLimit: number = 5000000;

  public allocate(tokensEstimated: number): boolean {
    if (this.resources.tokensConsumed + tokensEstimated > this.tokenBudgetLimit) {
      console.warn(`[ResourceAllocator] Token budget limit exceeded! Requested: ${tokensEstimated}, Available: ${this.tokenBudgetLimit - this.resources.tokensConsumed}`);
      return false;
    }
    this.resources.tokensConsumed += tokensEstimated;
    this.resources.cpuUsagePercent = Math.min(85, this.resources.cpuUsagePercent + 15);
    this.resources.memoryUsageMB = Math.min(1024, this.resources.memoryUsageMB + 64);
    return true;
  }

  public deallocate(tokensEstimated: number): void {
    this.resources.tokensConsumed = Math.max(0, this.resources.tokensConsumed - tokensEstimated);
    this.resources.cpuUsagePercent = Math.max(10, this.resources.cpuUsagePercent - 12);
    this.resources.memoryUsageMB = Math.max(120, this.resources.memoryUsageMB - 48);
  }

  public getStatus(): ResourceAllocation {
    return { ...this.resources };
  }

  public getRemainingTokenBudget(): number {
    return this.tokenBudgetLimit - this.resources.tokensConsumed;
  }

  public setProvider(providerName: string): void {
    this.resources.activeProvider = providerName;
  }

  public reset(): void {
    this.resources = {
      cpuUsagePercent: 10,
      memoryUsageMB: 120,
      tokensConsumed: 0,
      maxParallelLimit: 4,
      activeProvider: 'Google Gemini'
    };
  }
}

export const resourceAllocatorOS = new ResourceAllocator();
export default resourceAllocatorOS;
