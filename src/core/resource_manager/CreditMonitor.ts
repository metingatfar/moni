export class CreditMonitor {
  private remainingCredits = 150.0; // USD
  private monthlyLimit = 500.0;
  private monthlySpent = 75.0;

  public getBalance(): number {
    return this.remainingCredits;
  }

  public getSpent(): number {
    return this.monthlySpent;
  }

  public getLimit(): number {
    return this.monthlyLimit;
  }

  public spendCredits(usdAmount: number): void {
    const cost = Math.min(this.remainingCredits, usdAmount);
    this.remainingCredits -= cost;
    this.monthlySpent += cost;
  }

  public addCredits(amount: number): void {
    this.remainingCredits += amount;
  }
}
