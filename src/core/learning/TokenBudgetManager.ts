export class TokenBudgetManager {
  private dailyTokenLimit = 100000;
  private usedTokens = 0;
  private warningThreshold = 20000; // 20% warning threshold

  constructor() {
    this.loadBudget();
  }

  private loadBudget(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('moni_token_budget');
        if (stored) {
          this.usedTokens = parseInt(stored, 10);
        }
      }
    } catch (_) {}
  }

  private saveBudget(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('moni_token_budget', this.usedTokens.toString());
      }
    } catch (_) {}
  }

  public trackUsage(tokens: number): void {
    this.usedTokens += tokens;
    this.saveBudget();
  }

  public getRemainingTokens(): number {
    return Math.max(0, this.dailyTokenLimit - this.usedTokens);
  }

  public getCostMode(): 'Normal' | 'Saving' | 'Critical' {
    const remaining = this.getRemainingTokens();
    if (remaining === 0) return 'Critical';
    if (remaining < this.warningThreshold) return 'Saving';
    return 'Normal';
  }

  public getCostDiagnostic() {
    return {
      dailyTokenLimit: this.dailyTokenLimit,
      usedTokens: this.usedTokens,
      remainingTokens: this.getRemainingTokens(),
      costMode: this.getCostMode()
    };
  }

  public clear(): void {
    this.usedTokens = 0;
    this.saveBudget();
  }
}

export const tokenBudgetManager = new TokenBudgetManager();
