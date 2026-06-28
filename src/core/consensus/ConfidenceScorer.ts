import type { UnifiedAIResponse } from '../llm/ResponseNormalizer';

export interface ScoreBreakdown {
  architectureQuality: number; // 0-100
  codingQuality: number; // 0-100
  planningQuality: number; // 0-100
  repositoryAwareness: number; // 0-100
  contextAccuracy: number; // 0-100
  historicalPerformance: number; // 0-100
  aggregateScore: number; // 0-100
}

export class ConfidenceScorer {
  public scoreResponse(provider: string, response: UnifiedAIResponse, winRate = 80): ScoreBreakdown {
    console.log(`[ConfidenceScorer] Scoring response from provider: ${provider}`);
    const code = response.codeSuggestion || '';
    const explanation = response.explanation || '';
    
    // Coding Quality heuristic: basic presence of code structure, type annotations, etc.
    const codingQuality = code.length > 0 ? (code.includes('import') || code.includes('export') || code.includes('interface') ? 95 : 85) : 40;
    
    // Architecture Quality heuristic: design patterns presence
    const architectureQuality = explanation.includes('pattern') || explanation.includes('architecture') || code.includes('class') ? 92 : 80;

    // Planning Quality
    const planningQuality = explanation.length > 50 ? 90 : 70;

    // Repository awareness
    const repositoryAwareness = 88;

    // Context accuracy
    const contextAccuracy = 90;

    // Historical Performance mapping
    const historicalPerformance = winRate;

    // Calculate weighted aggregate
    const aggregateScore = Math.round(
      (codingQuality * 0.25) +
      (architectureQuality * 0.25) +
      (planningQuality * 0.15) +
      (repositoryAwareness * 0.10) +
      (contextAccuracy * 0.10) +
      (historicalPerformance * 0.15)
    );

    return {
      architectureQuality,
      codingQuality,
      planningQuality,
      repositoryAwareness,
      contextAccuracy,
      historicalPerformance,
      aggregateScore
    };
  }
}

export const confidenceScorer = new ConfidenceScorer();
export default confidenceScorer;
