export interface TestQualityScorecard {
  readabilityScore: number;
  maintainabilityScore: number;
  coverageScore: number;
  stabilityScore: number;
  reliabilityScore: number;
  overallScore: number;
}

export class TestQualityEngine {
  public scoreTestSuite(
    assertionsCount: number,
    coveragePercent: number,
    mutationScore: number
  ): TestQualityScorecard {
    const readabilityScore = assertionsCount > 0 ? 95 : 60;
    const maintainabilityScore = 90;
    const coverageScore = coveragePercent;
    const stabilityScore = mutationScore >= 90 ? 95 : 80;
    const reliabilityScore = Math.round((readabilityScore + stabilityScore + coverageScore) / 3);
    const overallScore = Math.round(
      (readabilityScore + maintainabilityScore + coverageScore + stabilityScore + reliabilityScore) / 5
    );

    return {
      readabilityScore,
      maintainabilityScore,
      coverageScore,
      stabilityScore,
      reliabilityScore,
      overallScore
    };
  }
}

export const testQualityEngine = new TestQualityEngine();
export default testQualityEngine;
