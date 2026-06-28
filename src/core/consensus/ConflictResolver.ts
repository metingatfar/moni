import type { UnifiedAIResponse } from '../llm/ResponseNormalizer';

export interface ConflictDetails {
  hasConflict: boolean;
  detectedConflicts: string[];
  resolvedStrategy: string;
  resolutionDetails: string;
}

export class ConflictResolver {
  public resolveConflicts(responses: Map<string, UnifiedAIResponse>): ConflictDetails {
    const detectedConflicts: string[] = [];
    const strategies = Array.from(responses.entries()).map(([provider, res]) => {
      const content = (res.explanation || '').toLowerCase() + ' ' + (res.codeSuggestion || '').toLowerCase();
      let strategy = 'Refactor'; // Default strategy
      
      if (content.includes('create new') || content.includes('new file') || content.includes('new service')) {
        strategy = 'Create New Service';
      } else if (content.includes('keep') || content.includes('existing') || content.includes('no change')) {
        strategy = 'Keep Existing Architecture';
      }
      
      return { provider, strategy, response: res };
    });

    // Check if there are different strategies
    const uniqueStrategies = new Set(strategies.map(s => s.strategy));
    let hasConflict = uniqueStrategies.size > 1;

    if (hasConflict) {
      detectedConflicts.push(`Strategy Mismatch: Providers disagree on architectural strategy. Alternatives: ${Array.from(uniqueStrategies).join(', ')}`);
    }

    // Default resolution: majority vote, or fallback to safest ("Keep Existing Architecture" or "Refactor" if most providers say so)
    const votes: Record<string, number> = {};
    for (const s of strategies) {
      votes[s.strategy] = (votes[s.strategy] || 0) + 1;
    }

    let resolvedStrategy = 'Refactor';
    let maxVotes = 0;
    for (const [strategy, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        resolvedStrategy = strategy;
      }
    }

    let resolutionDetails = '';
    if (hasConflict) {
      resolutionDetails = `Conflict resolved in favor of majority decision '${resolvedStrategy}' with ${maxVotes} votes.`;
    } else {
      resolutionDetails = `No major strategy conflict detected. Consistently agreed on '${resolvedStrategy}'.`;
    }

    return {
      hasConflict,
      detectedConflicts,
      resolvedStrategy,
      resolutionDetails
    };
  }
}

export const conflictResolver = new ConflictResolver();
export default conflictResolver;
