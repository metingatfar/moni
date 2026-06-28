export class TokenBudgetMonitor {
  private remainingTokens = 2000000;
  private totalUsedTokens = 450000;
  private sessionUsedTokens = 0;
  private usageHistory: number[] = [];

  public getRemaining(): number {
    return this.remainingTokens;
  }

  public getUsed(): number {
    return this.totalUsedTokens;
  }

  public getSessionUsed(): number {
    return this.sessionUsedTokens;
  }

  public spendTokens(amount: number): void {
    const cost = Math.min(this.remainingTokens, amount);
    this.remainingTokens -= cost;
    this.totalUsedTokens += cost;
    this.sessionUsedTokens += cost;
    this.usageHistory.push(cost);
  }

  public resetSession(): void {
    this.sessionUsedTokens = 0;
  }

  public clearHistory(): void {
    this.usageHistory = [];
  }
}
