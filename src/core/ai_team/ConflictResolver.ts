export interface ConflictResolution {
  resolved: boolean;
  finalDecision: string;
  winningAgent: string;
  losingAgent: string;
  confidenceScore: number;
  reasoning: string;
}

export class ConflictResolver {
  public resolveConflict(
    topic: string,
    agentA: string,
    confidenceA: number,
    opinionA: string,
    agentB: string,
    confidenceB: number,
    opinionB: string
  ): ConflictResolution {
    // Determine winner based on confidence score
    const winner = confidenceA >= confidenceB ? agentA : agentB;
    const loser = winner === agentA ? agentB : agentA;
    const winningOpinion = winner === agentA ? opinionA : opinionB;
    const losingOpinion = winner === agentA ? opinionB : opinionA;
    const diff = Math.abs(confidenceA - confidenceB);

    return {
      resolved: true,
      finalDecision: winningOpinion,
      winningAgent: winner,
      losingAgent: loser,
      confidenceScore: Math.max(confidenceA, confidenceB),
      reasoning: `Resolved dispute regarding "${topic}". ${winner} won over ${loser} due to higher confidence margin (diff: ${diff.toFixed(2)}). Chosen recommendation: "${winningOpinion}" instead of "${losingOpinion}".`
    };
  }
}
