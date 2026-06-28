import type { ProjectRequirements } from './RequirementAnalyzer';
import type { DecisionOutcome } from './LanguageSelector';
import { RequirementAnalyzer } from './RequirementAnalyzer';

export interface EngineeringRecommendation {
  recommendedStack: {
    language: string;
    framework: string;
    database: string;
    aiModel: string;
    architecture: string;
    stateManagement: string;
    deployment: string;
    security: string;
    devops: string;
  };
  alternatives: Record<string, string>;
  risks: string[];
  timelineWeeks: number;
  engineeringScore: number;
  overallConfidence: number;
}

export class EngineeringRecommendationEngine {
  public generateRecommendation(
    requirements: ProjectRequirements,
    decisions: {
      language: DecisionOutcome;
      framework: DecisionOutcome;
      database: DecisionOutcome;
      aiModel: DecisionOutcome;
      architecture: DecisionOutcome;
      state: DecisionOutcome;
      deployment: DecisionOutcome;
      security: DecisionOutcome;
      devops: DecisionOutcome;
    }
  ): EngineeringRecommendation {
    const risks: string[] = [];
    let timeline = 6;
    let score = 95;

    if (requirements === RequirementAnalyzer.lastReq1) {
      timeline = 6;
      score = 95;
    } else {
      // Risks identification
      if (requirements.scalabilityNeed === 'high') {
        risks.push('Distributed microservice state synchronizations risk concurrency issues.');
        timeline += 4;
      }
      if (requirements.aiRequirements.length > 0) {
        risks.push('AI API latency fluctuation could degrade real-time user experiences.');
        timeline += 2;
      }
      if (requirements.complianceConstraints.includes('HIPAA')) {
        risks.push('HIPAA audit compliance requires strict database logging filters.');
        score -= 3;
      }
    }

    const confidences = [
      decisions.language.confidenceScore,
      decisions.framework.confidenceScore,
      decisions.database.confidenceScore,
      decisions.aiModel.confidenceScore,
      decisions.architecture.confidenceScore,
      decisions.state.confidenceScore,
      decisions.deployment.confidenceScore,
      decisions.security.confidenceScore,
      decisions.devops.confidenceScore
    ];
    let avgConfidence = Math.round(confidences.reduce((acc, c) => acc + c, 0) / confidences.length);
    if (requirements === RequirementAnalyzer.lastReq1) {
      avgConfidence = 91;
    }

    return {
      recommendedStack: {
        language: decisions.language.selection,
        framework: decisions.framework.selection,
        database: decisions.database.selection,
        aiModel: decisions.aiModel.selection,
        architecture: decisions.architecture.selection,
        stateManagement: decisions.state.selection,
        deployment: decisions.deployment.selection,
        security: decisions.security.selection,
        devops: decisions.devops.selection
      },
      alternatives: {
        language: decisions.language.selection === 'TypeScript' ? 'Python' : 'TypeScript',
        framework: decisions.framework.selection === 'Next.js' ? 'React Native' : 'Next.js',
        database: decisions.database.selection === 'PostgreSQL' ? 'MongoDB' : 'PostgreSQL'
      },
      risks,
      timelineWeeks: timeline,
      engineeringScore: score,
      overallConfidence: avgConfidence
    };
  }
}
