import type { UnifiedAIResponse } from '../llm/ResponseNormalizer';
import type { ScoreBreakdown } from './ConfidenceScorer';

export interface ConsensusDecision {
  selectedProvider: string;
  selectedResponse: UnifiedAIResponse;
  selectedStrategy: string;
  confidence: number;
  rejectedAlternatives: string[];
  reasoningSummary: string;
  scoreDetails: ScoreBreakdown;
}

export class ConsensusDecisionEngine {
  public formulateDecision(
    responses: Map<string, UnifiedAIResponse>,
    scores: Map<string, ScoreBreakdown>,
    resolvedStrategy: string
  ): ConsensusDecision {
    if (responses.size === 0) {
      throw new Error('ConsensusDecisionEngine requires at least one provider response.');
    }

    let selectedProvider = '';
    let maxScore = -1;

    for (const [provider, breakdown] of scores.entries()) {
      if (breakdown.aggregateScore > maxScore) {
        maxScore = breakdown.aggregateScore;
        selectedProvider = provider;
      }
    }

    const selectedResponse = responses.get(selectedProvider)!;
    const rejectedAlternatives = Array.from(responses.keys()).filter(p => p !== selectedProvider);

    const reasoningSummary = `Selected ${selectedProvider}'s proposal based on an aggregate confidence score of ${maxScore}/100. Resolution strategy adopted: ${resolvedStrategy}.`;

    return {
      selectedProvider,
      selectedResponse,
      selectedStrategy: resolvedStrategy,
      confidence: maxScore,
      rejectedAlternatives,
      reasoningSummary,
      scoreDetails: scores.get(selectedProvider)!
    };
  }
}

export const consensusDecisionEngine = new ConsensusDecisionEngine();
export default consensusDecisionEngine;
