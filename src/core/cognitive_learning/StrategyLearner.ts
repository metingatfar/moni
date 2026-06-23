export interface StrategyScore {
  strategyName: string;
  successCount: number;
  failureCount: number;
  score: number; // 0 - 1.0
}

export class StrategyLearner {
  private strategies: Map<string, StrategyScore> = new Map();

  public learnStrategy(strategyName: string, outcome: 'success' | 'failure' | 'rejected' | 'incomplete'): void {
    if (!strategyName) return;

    const existing = this.strategies.get(strategyName) || {
      strategyName,
      successCount: 0,
      failureCount: 0,
      score: 1.0
    };

    if (outcome === 'success') {
      existing.successCount++;
    } else if (outcome === 'failure' || outcome === 'rejected') {
      existing.failureCount++;
    }

    const total = existing.successCount + existing.failureCount;
    existing.score = total > 0 ? existing.successCount / total : 1.0;

    this.strategies.set(strategyName, existing);
  }

  public getBestStrategies(): string[] {
    return Array.from(this.strategies.values())
      .filter(s => s.score >= 0.7 && s.successCount > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.strategyName);
  }

  public getFailedStrategies(): string[] {
    return Array.from(this.strategies.values())
      .filter(s => s.score < 0.5 && s.failureCount > 0)
      .map(s => s.strategyName);
  }
}
