export interface RetryDecision {
  shouldRetry: boolean;
  reason: string;
  nextAttemptNumber: number;
}

export class RetryPolicyEngine {
  public evaluateRetry(
    currentAttempt: number,
    previousFailureMessage: string,
    currentFailureMessage: string,
    confidenceScore: number,
    risk: 'low' | 'medium' | 'high'
  ): RetryDecision {
    const maxAttempts = 3;
    const nextAttemptNumber = currentAttempt + 1;

    if (currentAttempt >= maxAttempts) {
      return {
        shouldRetry: false,
        reason: 'Maximum self-healing attempts threshold (3) exceeded.',
        nextAttemptNumber
      };
    }

    if (previousFailureMessage === currentFailureMessage && currentAttempt > 1) {
      return {
        shouldRetry: false,
        reason: 'Self-healing stopped due to repeated identical errors (looping safeguard).',
        nextAttemptNumber
      };
    }

    if (risk === 'high' && currentAttempt >= 1) {
      return {
        shouldRetry: false,
        reason: 'Self-healing halted because risk is high and first attempt failed.',
        nextAttemptNumber
      };
    }

    if (confidenceScore < 60) {
      return {
        shouldRetry: false,
        reason: `Self-healing halted because healing confidence (${confidenceScore}%) falls below safety threshold (60%).`,
        nextAttemptNumber
      };
    }

    return {
      shouldRetry: true,
      reason: `Proceeding with self-healing retry attempt #${nextAttemptNumber}.`,
      nextAttemptNumber
    };
  }
}

export const retryPolicyEngine = new RetryPolicyEngine();
export default retryPolicyEngine;
