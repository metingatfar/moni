import type { DecisionAlternative } from './AlternativeGenerator';

export interface RiskAnalysisResult {
  planName: string;
  overallRiskScore: 'low' | 'medium' | 'high';
  risks: {
    category: 'technical' | 'health' | 'financial' | 'security' | 'conflict';
    probability: number; // 0 to 1.0
    impact: number; // 0 to 1.0
    mitigation: string;
  }[];
}

export class RiskAnalyzer {
  public analyzeRisk(alternative: DecisionAlternative): RiskAnalysisResult {
    const risks: RiskAnalysisResult['risks'] = [];
    const nameLower = alternative.planName.toLowerCase();

    // 1. Health/Safety checks (Highest priority)
    if (nameLower.includes('diyet') || nameLower.includes('egzersiz') || nameLower.includes('spor')) {
      risks.push({
        category: 'health',
        probability: 0.1,
        impact: 0.8,
        mitigation: 'Sağlık durumu stabil değilse aktiviteyi durdurmak için HealthAgent öncelikli kalır.'
      });
    }

    // 2. Financial/API Cost checks
    if (alternative.estimatedCost > 50) {
      risks.push({
        category: 'financial',
        probability: 0.9,
        impact: 0.6,
        mitigation: 'Token bütçesi limitlerinde ise TokenBudgetManager tasarruf moduna geçer.'
      });
    }

    // 3. Technical / Conflict checks
    if (alternative.complexity === 'high') {
      risks.push({
        category: 'technical',
        probability: 0.4,
        impact: 0.5,
        mitigation: 'Adımları daha ufak subtasklere bölerek planlama riskini düşür.'
      });
    }

    // Determine overall score based on individual risk impact/probability
    let overallRiskScore: RiskAnalysisResult['overallRiskScore'] = 'low';
    const hasHighImpact = risks.some(r => r.impact >= 0.7 && r.probability >= 0.3);
    const hasMediumImpact = risks.some(r => r.impact >= 0.5);

    if (hasHighImpact) overallRiskScore = 'high';
    else if (hasMediumImpact) overallRiskScore = 'medium';

    return {
      planName: alternative.planName,
      overallRiskScore,
      risks
    };
  }
}
