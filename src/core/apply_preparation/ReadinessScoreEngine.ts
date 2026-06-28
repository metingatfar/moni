export class ReadinessScoreEngine {
  public calculateReadinessScore(
    reviewScore: number,
    validationScore: number,
    sandboxPassed: boolean,
    compilePassed: boolean,
    regressionPassed: boolean
  ): number {
    let score = (reviewScore + validationScore) / 2;
    if (!sandboxPassed) score -= 20;
    if (!compilePassed) score -= 15;
    if (!regressionPassed) score -= 15;
    return Math.max(0, Math.min(100, score));
  }
}

export const readinessScoreEngine = new ReadinessScoreEngine();
export default readinessScoreEngine;
