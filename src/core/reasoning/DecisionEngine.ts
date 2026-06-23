import type { DecisionAlternative } from './AlternativeGenerator';
import type { RiskAnalysisResult } from './RiskAnalyzer';

export interface DecisionChoice {
  selectedAlternative: DecisionAlternative;
  riskAnalysis: RiskAnalysisResult;
  finalScore: number;
}

export class DecisionEngine {
  public makeDecision(alternatives: DecisionAlternative[], risks: RiskAnalysisResult[]): DecisionChoice {
    let bestAlternative = alternatives[0];
    let bestRisk = risks[0];
    let maxScore = -1;

    for (let i = 0; i < alternatives.length; i++) {
      const alt = alternatives[i];
      const r = risks.find(item => item.planName === alt.planName) || risks[i];

      // Score calculation: higher confidence is better, lower cost/risk is better
      let score = alt.confidence * 0.6;
      
      const costFactor = (100 - alt.estimatedCost) / 100;
      score += costFactor * 0.2;

      const riskFactor = r.overallRiskScore === 'low' ? 0.2 : r.overallRiskScore === 'medium' ? 0.1 : 0.0;
      score += riskFactor;

      if (score > maxScore) {
        maxScore = score;
        bestAlternative = alt;
        bestRisk = r;
      }
    }

    return {
      selectedAlternative: bestAlternative,
      riskAnalysis: bestRisk,
      finalScore: Math.round(maxScore * 100) / 100
    };
  }
}
export const decisionEngine = new DecisionEngine();
export default decisionEngine;
