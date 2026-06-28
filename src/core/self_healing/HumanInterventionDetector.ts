export interface InterventionCheck {
  requiresIntervention: boolean;
  reason: string;
  triggerKey: 'high_risk' | 'repeated_failure' | 'low_confidence' | 'unknown_error' | 'security_sensitive' | 'none';
}

export class HumanInterventionDetector {
  public check(
    errorType: string,
    confidenceScore: number,
    hasRepeatedFailure: boolean,
    risk: 'low' | 'medium' | 'high'
  ): InterventionCheck {
    if (risk === 'high') {
      return {
        requiresIntervention: true,
        reason: 'Halted self-healing: High-risk structural refactoring requires explicit developer authorization.',
        triggerKey: 'high_risk'
      };
    }

    if (hasRepeatedFailure) {
      return {
        requiresIntervention: true,
        reason: 'Halted self-healing: Repeated failed attempts with the same strategy detected.',
        triggerKey: 'repeated_failure'
      };
    }

    if (confidenceScore < 60) {
      return {
        requiresIntervention: true,
        reason: `Halted self-healing: Scored healing confidence (${confidenceScore}%) is below safety gateway limit (60%).`,
        triggerKey: 'low_confidence'
      };
    }

    const lowerError = errorType.toLowerCase();
    if (lowerError.includes('security') || lowerError.includes('auth') || lowerError.includes('secret') || lowerError.includes('key')) {
      return {
        requiresIntervention: true,
        reason: 'Halted self-healing: Detected security-sensitive scope. Human audit is mandatory.',
        triggerKey: 'security_sensitive'
      };
    }

    if (lowerError.includes('unknown') || lowerError.includes('unhandled')) {
      return {
        requiresIntervention: true,
        reason: 'Halted self-healing: Unknown error classification signature.',
        triggerKey: 'unknown_error'
      };
    }

    return {
      requiresIntervention: false,
      reason: 'Safe to proceed with autonomous repair loop.',
      triggerKey: 'none'
    };
  }
}

export const humanInterventionDetector = new HumanInterventionDetector();
export default humanInterventionDetector;
