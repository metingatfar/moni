import type { AgentVote } from '../collaboration/AgentVote';

export class ConflictResolver {
  private conflictCount = 0;
  private resolvedConflictCount = 0;

  // Domain priorities (lower index = higher priority)
  private priorityList = [
    'health_agent',
    'goal_agent',
    'fitness_agent',
    'work_agent',
    'learning_agent',
    'notification_agent'
  ];

  public resolveConflicts(votes: AgentVote[]): AgentVote[] {
    const hasHealth = votes.some(v => v.agentId === 'health_agent');
    const hasFitness = votes.some(v => v.agentId === 'fitness_agent');

    // 1. Detect conflict (e.g. Health warns of fatigue, Fitness wants exercise)
    if (hasHealth && hasFitness) {
      const healthVote = votes.find(v => v.agentId === 'health_agent')!;
      const fitnessVote = votes.find(v => v.agentId === 'fitness_agent')!;

      // Health warns of fatigue, Fitness wants running/intense training
      const isHealthFatigued = healthVote.summary.toLowerCase().includes('yorgun') || healthVote.risk !== '';
      const isFitnessActive = fitnessVote.summary.toLowerCase().includes('koşu') || fitnessVote.summary.toLowerCase().includes('antrenman') || fitnessVote.summary.toLowerCase().includes('yüzme');

      if (isHealthFatigued && isFitnessActive) {
        this.conflictCount++;
        // Apply conflict resolution: decrease fitness confidence, override fitness action with health advice
        fitnessVote.confidence = 0.4; // demote fitness confidence
        fitnessVote.summary = "Sağlık uyarısı nedeniyle antrenman hafif esneme hareketlerine düşürüldü.";
        fitnessVote.suggestedActions = []; // strip strenuous action suggestions
        this.resolvedConflictCount++;
        console.log('[ConflictResolver] Health constraint resolved over Fitness activity request.');
      }
    }

    // Sort votes by priorityList index
    return [...votes].sort((a, b) => {
      let idxA = this.priorityList.indexOf(a.agentId);
      let idxB = this.priorityList.indexOf(b.agentId);
      if (idxA === -1) idxA = 99;
      if (idxB === -1) idxB = 99;
      return idxA - idxB;
    });
  }

  public getConflictCount(): number {
    return this.conflictCount;
  }

  public getResolvedConflictCount(): number {
    return this.resolvedConflictCount;
  }
}

export const conflictResolver = new ConflictResolver();
