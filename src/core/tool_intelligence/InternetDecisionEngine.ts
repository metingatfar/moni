export class InternetDecisionEngine {
  private internetDecisionsCount = 0;
  private localDecisionsCount = 0;

  /**
   * Decide if internet access is required.
   * By default, it will NOT use the internet unless the user explicitly requests research
   * or a query requests fresh/real-time information (e.g. news, weather, exchange rates).
   */
  public decide(input: string): { useInternet: boolean; reason: string } {
    const lower = input.toLowerCase().trim();

    // 1. User explicitly requests research
    if (
      lower.includes('internette araştır') ||
      lower.includes('google\'da ara') ||
      lower.includes('internetten bak') ||
      lower.includes('internetten araştır') ||
      lower.includes('araştır')
    ) {
      this.internetDecisionsCount++;
      return {
        useInternet: true,
        reason: 'User explicitly requested internet research.'
      };
    }

    // 2. Real-time details required (weather, news, exchange rate)
    if (
      lower.includes('hava durumu') ||
      lower.includes('son dakika') ||
      lower.includes('dolar kuru') ||
      lower.includes('euro kuru') ||
      lower.includes('altın fiyatı')
    ) {
      this.internetDecisionsCount++;
      return {
        useInternet: true,
        reason: 'Real-time details requested which are not stored locally.'
      };
    }

    // 3. Otherwise: default to using Local Knowledge
    this.localDecisionsCount++;
    return {
      useInternet: false,
      reason: 'Use Local Knowledge. No real-time or explicit research request detected.'
    };
  }

  public getStats() {
    return {
      internetDecisions: this.internetDecisionsCount,
      localDecisions: this.localDecisionsCount
    };
  }
}
export const internetDecisionEngine = new InternetDecisionEngine();
