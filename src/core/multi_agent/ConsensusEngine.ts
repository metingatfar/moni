import { container } from '../container/ServiceContainer';

export type ConsensusVerdict = 'Accepted' | 'Rejected' | 'Requires Discussion';

export interface ConsensusInput {
  agentName: string;
  confidence: number; // 0-100
  expertise: number; // 0-100
  risk: number; // 0-100
  historicalAccuracy: number; // 0-100
  previousDecisionQuality?: number; // 0-100
}

export interface ConsensusOutput {
  verdict: ConsensusVerdict;
  consensusScore: number; // 0-100
  reasoning: string;
}

export class ConsensusEngine {
  public computeConsensus(inputs: ConsensusInput[]): ConsensusOutput {
    if (inputs.length === 0) {
      return {
        verdict: 'Requires Discussion',
        consensusScore: 0,
        reasoning: 'No agent opinions provided.'
      };
    }

    let weightedConfidenceSum = 0;
    let weightSum = 0;
    let highRiskCount = 0;

    let repEngine: any = null;
    try {
      repEngine = container.resolve<any>('AgentReputationEngine');
    } catch (_) {}

    for (const input of inputs) {
      let reputationScore = 90;
      let historicalAccuracy = input.historicalAccuracy;
      let engineeringExpertise = input.expertise;
      let previousDecisionQuality = input.previousDecisionQuality ?? 85;

      if (repEngine) {
        const profile = repEngine.getProfile(input.agentName);
        if (profile) {
          reputationScore = profile.accuracyScore;
          historicalAccuracy = profile.historicalSuccessRate;
          engineeringExpertise = profile.engineeringExpertiseRating;
          previousDecisionQuality = Math.round((profile.historicalSuccessRate + profile.learningProgressIndex) / 2);
        }
      }

      // Weight combines: Agent Reputation (25%), Historical Accuracy (25%), Expertise (20%), Confidence (20%), Previous Decision Quality (10%)
      const weight = 
        (reputationScore * 0.25) + 
        (historicalAccuracy * 0.25) + 
        (engineeringExpertise * 0.20) + 
        (input.confidence * 0.20) + 
        (previousDecisionQuality * 0.10);

      // Risk reduces confidence weight slightly
      const adjustedConfidence = input.confidence * (1 - (input.risk / 300));

      weightedConfidenceSum += adjustedConfidence * weight;
      weightSum += weight;

      if (input.risk > 75) {
        highRiskCount++;
      }
    }

    const consensusScore = weightSum > 0 ? Math.round(weightedConfidenceSum / weightSum) : 50;

    let verdict: ConsensusVerdict = 'Accepted';
    let reasoning = `Consensus achieved with reputation-weighted score of ${consensusScore}%.`;

    if (consensusScore < 50) {
      verdict = 'Rejected';
      reasoning = `Consensus rejected due to low weighted reputation score of ${consensusScore}%.`;
    } else if (consensusScore >= 50 && consensusScore < 70) {
      verdict = 'Requires Discussion';
      reasoning = `Consensus is ambiguous (${consensusScore}%). Requires further team discussion.`;
    }

    if (highRiskCount > 0 && verdict === 'Accepted') {
      verdict = 'Requires Discussion';
      reasoning += ' Flagged for discussion due to high-risk evaluations from one or more agents.';
    }

    return {
      verdict,
      consensusScore,
      reasoning
    };
  }
}

