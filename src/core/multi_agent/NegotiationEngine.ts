export interface NegotiationProposal {
  topic: 'architecture' | 'database' | 'security' | 'performance' | 'ux';
  proposingAgent: string;
  proposedSolution: string;
  reasoning: string;
  complexity: 'Low' | 'Medium' | 'High';
  durationMinutes: number;
}

export interface NegotiationResult {
  accepted: boolean;
  finalSolution: string;
  argumentsTraced: string[];
}

export class NegotiationEngine {
  public negotiate(
    topic: NegotiationProposal['topic'],
    proposals: NegotiationProposal[]
  ): NegotiationResult {
    const argumentsTraced: string[] = [];
    
    if (proposals.length === 0) {
      return {
        accepted: false,
        finalSolution: 'No solutions proposed.',
        argumentsTraced: ['No proposals found.']
      };
    }

    if (proposals.length === 1) {
      argumentsTraced.push(`Single proposal from ${proposals[0].proposingAgent} accepted directly for ${topic}.`);
      return {
        accepted: true,
        finalSolution: proposals[0].proposedSolution,
        argumentsTraced
      };
    }

    // Select proposal based on low complexity and short duration as criteria for negotiation compromise
    let bestProposal = proposals[0];
    argumentsTraced.push(`Evaluating proposals for topic: ${topic}`);

    for (const prop of proposals) {
      argumentsTraced.push(`Agent ${prop.proposingAgent} proposed: "${prop.proposedSolution}" (Complexity: ${prop.complexity}, Duration: ${prop.durationMinutes}m)`);
      
      const currentScore = this.getProposalScore(bestProposal);
      const testScore = this.getProposalScore(prop);

      if (testScore > currentScore) {
        bestProposal = prop;
      }
    }

    argumentsTraced.push(`Negotiation compromise chosen: Agent ${bestProposal.proposingAgent}'s solution.`);

    return {
      accepted: true,
      finalSolution: bestProposal.proposedSolution,
      argumentsTraced
    };
  }

  private getProposalScore(proposal: NegotiationProposal): number {
    let score = 100;
    if (proposal.complexity === 'High') {
      score -= 30;
    } else if (proposal.complexity === 'Medium') {
      score -= 10;
    }
    score -= proposal.durationMinutes * 0.1;
    return score;
  }
}
