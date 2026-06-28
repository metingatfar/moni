export interface MergedOutput {
  decisionKey: string;
  resolvedOutput: string;
  consensusScore: number;
  conflictsResolved: string[];
}

export class AgentDecisionMerger {
  public mergeDecisions(decisions: Array<{ agentId: string; priority: string; confidence: number; recommendation: string }>): MergedOutput {
    if (decisions.length === 0) {
      return {
        decisionKey: 'empty',
        resolvedOutput: 'No agent decisions to merge.',
        consensusScore: 100,
        conflictsResolved: []
      };
    }

    const conflictsResolved: string[] = [];
    let totalConfidence = 0;
    
    // Simple decision merge: Select recommendation with the highest priority and confidence
    let bestRec = decisions[0];
    totalConfidence += decisions[0].confidence;

    for (let i = 1; i < decisions.length; i++) {
      const current = decisions[i];
      totalConfidence += current.confidence;

      const priorityWeight = (p: string) => p === 'critical' ? 4 : p === 'high' ? 3 : p === 'medium' ? 2 : 1;
      
      if (
        priorityWeight(current.priority) > priorityWeight(bestRec.priority) ||
        (priorityWeight(current.priority) === priorityWeight(bestRec.priority) && current.confidence > bestRec.confidence)
      ) {
        conflictsResolved.push(`Overrode recommendation from '${bestRec.agentId}' with higher priority/confidence from '${current.agentId}'`);
        bestRec = current;
      } else {
        if (current.recommendation !== bestRec.recommendation) {
          conflictsResolved.push(`Discarded conflicting recommendation from '${current.agentId}'`);
        }
      }
    }

    const averageConfidence = Math.round(totalConfidence / decisions.length);
    const consensusScore = Math.min(100, Math.max(0, averageConfidence - (conflictsResolved.length * 5)));

    return {
      decisionKey: 'multi_agent_merge',
      resolvedOutput: bestRec.recommendation,
      consensusScore,
      conflictsResolved
    };
  }
}

export const agentDecisionMerger = new AgentDecisionMerger();
export default agentDecisionMerger;
