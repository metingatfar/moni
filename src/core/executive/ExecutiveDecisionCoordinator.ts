export interface EngineDecision {
  engineName: string;
  recommendedAction: string;
  safetyScore: number; // 0-100
  confidence: number; // 0.0-1.0
}

export class ExecutiveDecisionCoordinator {
  public resolveConflict(decisions: EngineDecision[]): EngineDecision {
    if (decisions.length === 0) {
      return {
        engineName: 'Default',
        recommendedAction: 'fallback_response',
        safetyScore: 100,
        confidence: 1.0
      };
    }
    
    // Safety score has priority, followed by confidence.
    return decisions.reduce((best, current) => {
      if (current.safetyScore > best.safetyScore) {
        return current;
      }
      if (current.safetyScore === best.safetyScore && current.confidence > best.confidence) {
        return current;
      }
      return best;
    }, decisions[0]);
  }
}
