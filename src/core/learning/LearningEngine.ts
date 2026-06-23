import { agentMemory } from './AgentMemory';
import { agentPerformanceTracker } from './AgentPerformanceTracker';
import { conflictResolver } from './ConflictResolver';
import { costOptimizer } from './CostOptimizer';
import { tokenBudgetManager } from './TokenBudgetManager';
import { agentFeedbackEngine } from './AgentFeedbackEngine';
import { smartCache } from './SmartCache';

export class LearningEngine {
  public analyzeAgentPerformance(agentId: string) {
    return {
      score: agentPerformanceTracker.getPerformanceScore(agentId),
      memory: agentMemory.getOrCreate(agentId)
    };
  }

  public optimizeAgentSelection(input: string, activeGoals: string[]): boolean {
    return costOptimizer.shouldSkipPipeline(input, activeGoals);
  }

  public resolveConflicts(votes: any[]): any[] {
    return conflictResolver.resolveConflicts(votes);
  }

  public trackFeedback(input: string): boolean {
    return agentFeedbackEngine.detectFeedback(input);
  }

  public getDiagnostics() {
    const costDiag = tokenBudgetManager.getCostDiagnostic();
    return {
      topAgent: agentPerformanceTracker.getTopAgents().join(', '),
      weakAgent: agentPerformanceTracker.getWeakAgents().join(', '),
      agentSuccessRate: Math.round(agentMemory.getAll().reduce((acc, item) => {
        const total = item.successCount + item.failureCount;
        if (total === 0) return acc;
        return acc + (item.successCount / total) * 100;
      }, 0) / (agentMemory.getAll().length || 1)),
      userAcceptedPercent: agentFeedbackEngine.getAcceptanceRate(),
      userRejectedPercent: agentFeedbackEngine.getRejectionRate(),
      averageCost: costOptimizer.getAverageCost(),
      estimatedTokens: 150, // simulated estimate per call
      tokenRemaining: costDiag.remainingTokens,
      cacheHitRate: smartCache.getHitRate(),
      conflictCount: conflictResolver.getConflictCount(),
      resolvedConflicts: conflictResolver.getResolvedConflictCount(),
      costMode: costDiag.costMode
    };
  }
}

export const learningEngine = new LearningEngine();
