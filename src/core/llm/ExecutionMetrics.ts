export interface MetricSummary {
  totalExecutions: number;
  averageLatencyMs: number;
  providerSuccessRates: Record<string, number>;
  totalTokensConsumed: number;
  totalCostEstimateUSD: number;
}

export class ExecutionMetrics {
  private executions = 0;
  private successCount = 0;
  private totalLatency = 0;
  private totalTokens = 0;
  private totalCost = 0;
  private providerSuccesses: Record<string, number> = {};
  private providerAttempts: Record<string, number> = {};

  public recordSuccess(provider: string, latencyMs: number, tokens: number, cost: number): void {
    this.executions++;
    this.successCount++;
    this.totalLatency += latencyMs;
    this.totalTokens += tokens;
    this.totalCost += cost;

    this.providerSuccesses[provider] = (this.providerSuccesses[provider] || 0) + 1;
    this.providerAttempts[provider] = (this.providerAttempts[provider] || 0) + 1;
  }

  public recordFailure(provider: string, latencyMs: number): void {
    this.executions++;
    this.totalLatency += latencyMs;
    this.providerAttempts[provider] = (this.providerAttempts[provider] || 0) + 1;
  }

  public getSummary(): MetricSummary {
    const providerSuccessRates: Record<string, number> = {};
    for (const key of Object.keys(this.providerAttempts)) {
      const attempts = this.providerAttempts[key];
      const successes = this.providerSuccesses[key] || 0;
      providerSuccessRates[key] = (successes / attempts) * 100;
    }

    return {
      totalExecutions: this.executions,
      averageLatencyMs: this.executions > 0 ? this.totalLatency / this.executions : 0,
      providerSuccessRates,
      totalTokensConsumed: this.totalTokens,
      totalCostEstimateUSD: this.totalCost
    };
  }
}

export const executionMetrics = new ExecutionMetrics();
export default executionMetrics;
