export interface TokenBudget {
  inputTokensEstimated: number;
  outputTokensEstimated: number;
  totalTokensEstimated: number;
  isWithinLimits: boolean;
  compressionNeeded: boolean;
}

export class TokenBudgetManager {
  public estimateBudget(promptLength: number, contextLength: number, maxLimit: number): TokenBudget {
    // Estimator: ~0.25 tokens per character
    const inputTokens = Math.ceil((promptLength + contextLength) * 0.25);
    const outputTokens = 1500; // estimated output budget
    const total = inputTokens + outputTokens;
    return {
      inputTokensEstimated: inputTokens,
      outputTokensEstimated: outputTokens,
      totalTokensEstimated: total,
      isWithinLimits: total <= maxLimit,
      compressionNeeded: total > maxLimit * 0.8
    };
  }
}

export const tokenBudgetManager = new TokenBudgetManager();
export default tokenBudgetManager;
