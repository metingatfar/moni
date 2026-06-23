import { agentMemory } from './AgentMemory';

export class AgentPerformanceTracker {
  public recordExecution(agentId: string, executionTime: number, confidence: number): void {
    const mem = agentMemory.getOrCreate(agentId);
    const count = mem.executionCount + 1;
    const avgTime = ((mem.averageExecutionTime * mem.executionCount) + executionTime) / count;
    const avgConf = ((mem.averageConfidence * mem.executionCount) + confidence) / count;

    agentMemory.update(agentId, {
      executionCount: count,
      averageExecutionTime: avgTime,
      averageConfidence: avgConf,
      lastUsedAt: new Date().toISOString()
    });
  }

  public recordSuccess(agentId: string): void {
    const mem = agentMemory.getOrCreate(agentId);
    agentMemory.update(agentId, { successCount: mem.successCount + 1 });
  }

  public recordFailure(agentId: string): void {
    const mem = agentMemory.getOrCreate(agentId);
    agentMemory.update(agentId, { failureCount: mem.failureCount + 1 });
  }

  public recordUserAccepted(agentId: string): void {
    const mem = agentMemory.getOrCreate(agentId);
    agentMemory.update(agentId, { acceptedCount: mem.acceptedCount + 1 });
  }

  public recordUserRejected(agentId: string): void {
    const mem = agentMemory.getOrCreate(agentId);
    agentMemory.update(agentId, { rejectedCount: mem.rejectedCount + 1 });
  }

  public getPerformanceScore(agentId: string): number {
    const mem = agentMemory.getOrCreate(agentId);
    if (mem.executionCount === 0) return 80; // Base score (0-100)

    const successRate = mem.successCount / (mem.successCount + mem.failureCount || 1);
    const acceptanceRate = mem.acceptedCount / (mem.acceptedCount + mem.rejectedCount || 1);
    
    // Weighted formula: 40% success rate, 30% acceptance rate, 30% average confidence
    const score = (successRate * 40) + (acceptanceRate * 30) + (mem.averageConfidence * 30);
    return Math.round(score);
  }

  public getTopAgents(): string[] {
    const all = agentMemory.getAll();
    if (all.length === 0) return ['GoalAgent', 'HealthAgent'];
    return all
      .map(item => ({ id: item.agentId, score: this.getPerformanceScore(item.agentId) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(item => item.id);
  }

  public getWeakAgents(): string[] {
    const all = agentMemory.getAll();
    if (all.length === 0) return ['None'];
    const weak = all
      .map(item => ({ id: item.agentId, score: this.getPerformanceScore(item.agentId) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .filter(item => item.score < 60)
      .map(item => item.id);
    return weak.length > 0 ? weak : ['None'];
  }
}

export const agentPerformanceTracker = new AgentPerformanceTracker();
