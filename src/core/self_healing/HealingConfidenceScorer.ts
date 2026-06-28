export class HealingConfidenceScorer {
  public calculateConfidence(
    certainty: number,
    patchSafety: number,
    testProbability: number,
    attemptsCount: number,
    risk: 'low' | 'medium' | 'high'
  ): number {
    let base = Math.round((certainty + patchSafety + testProbability) / 3);
    
    // Penalize for multiple retries
    base -= (attemptsCount - 1) * 10;
    
    // Penalize for higher risk categories
    if (risk === 'medium') base -= 5;
    if (risk === 'high') base -= 15;

    // Boundary constraint
    return Math.max(0, Math.min(100, base));
  }
}

export const healingConfidenceScorer = new HealingConfidenceScorer();
export default healingConfidenceScorer;
