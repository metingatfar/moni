import type { ProjectRequirements } from './RequirementAnalyzer';

export interface CostProjections {
  infrastructureMonthlyUSD: number;
  aiApiMonthlyUSD: number;
  developmentEstimateUSD: number;
  maintenanceAnnualUSD: number;
  breakdownExplanation: string;
}

export class CostAnalyzer {
  public analyzeCost(requirements: ProjectRequirements): CostProjections {
    let infra = 50; // default low cost server
    let ai = 0;
    let dev = 30000;
    let maintenance = 5000;

    if (requirements.scalabilityNeed === 'high') {
      infra = 800; // cluster sizing
      maintenance = 20000;
    } else if (requirements.estimatedTraffic > 1000) {
      infra = 250;
    }

    if (requirements.aiRequirements.length > 0) {
      ai = Math.round(requirements.estimatedTraffic * 0.002 * 30 * 24 * 3600 * 0.05); // estimate GPT token volume cost
      dev += 15000;
    }

    if (requirements.budgetUSD > 0) {
      dev = Math.round(requirements.budgetUSD * 0.6);
    }

    return {
      infrastructureMonthlyUSD: infra,
      aiApiMonthlyUSD: ai,
      developmentEstimateUSD: dev,
      maintenanceAnnualUSD: maintenance,
      breakdownExplanation: `Estimates calculated based on: Traffic: ${requirements.estimatedTraffic} req/s, AI modules count: ${requirements.aiRequirements.length}.`
    };
  }
}
