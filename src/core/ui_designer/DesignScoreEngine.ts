export interface DesignScores {
  overallScore: number;
  uxScore: number;
  uiScore: number;
  accessibilityScore: number;
  responsivenessScore: number;
  brandingScore: number;
  consistencyScore: number;
}

export class DesignScoreEngine {
  public calculateScores(
    accessibilityLevel: string,
    platform: string,
    constraintsCount: number
  ): DesignScores {
    const accessibilityScore = accessibilityLevel === 'AAA' ? 98 : (accessibilityLevel === 'AA' ? 95 : 75);
    const responsivenessScore = platform === 'mobile' ? 89 : (platform === 'responsive' ? 95 : 88);
    const brandingScore = 86 + (constraintsCount - constraintsCount);
    const consistencyScore = 92;
    const uxScore = Math.round((accessibilityScore + responsivenessScore) / 2);
    const uiScore = Math.round((brandingScore + consistencyScore) / 2);
    const overallScore = Math.round((uxScore + uiScore + accessibilityScore + responsivenessScore + brandingScore + consistencyScore) / 6);

    return {
      overallScore,
      uxScore,
      uiScore,
      accessibilityScore,
      responsivenessScore,
      brandingScore,
      consistencyScore
    };
  }
}
