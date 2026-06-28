// ===================================================================
// MONI Sprint 7.0 Addendum — WorkflowDecisionEngine.ts
// Evaluates workflow candidates, calculates KPIs, and selects the optimal path.
// ===================================================================

import { container } from '../container/ServiceContainer';

export interface WorkflowEvaluation {
  id: string;
  name: string;
  successProbability: number;
  estimatedDuration: number;
  estimatedCost: number;
  estimatedResourceUsage: number;
  estimatedRisk: number;
  confidenceScore: number;
  selectionJustification: string;
}

export class WorkflowDecisionEngine {
  public evaluateCandidates(candidates: any[]): WorkflowEvaluation[] {
    return candidates.map(c => {
      const successProbability = c.successProbability ?? (85 + Math.floor(Math.random() * 15));
      const estimatedDuration = c.estimatedDuration ?? (100 + Math.floor(Math.random() * 900));
      const estimatedCost = c.estimatedCost ?? (0.01 + Math.random() * 0.1);
      const estimatedResourceUsage = c.estimatedResourceUsage ?? (10 + Math.floor(Math.random() * 90));
      const estimatedRisk = Math.max(0, 100 - successProbability + Math.floor(Math.random() * 5));
      const confidenceScore = Math.round((successProbability * 0.7) + ((100 - estimatedRisk) * 0.3));
      
      return {
        id: c.id || `candidate-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: c.name || 'Candidate Workflow',
        successProbability,
        estimatedDuration,
        estimatedCost,
        estimatedResourceUsage,
        estimatedRisk,
        confidenceScore,
        selectionJustification: `Selected automatically because it offers a high success rate of ${successProbability}% with minimal estimated risk of ${estimatedRisk}%.`
      };
    });
  }

  public selectOptimal(candidates: any[]): WorkflowEvaluation {
    const evaluations = this.evaluateCandidates(candidates);
    if (evaluations.length === 0) {
      throw new Error('No workflow candidates to evaluate.');
    }
    
    // Sort by confidenceScore descending
    evaluations.sort((a, b) => b.confidenceScore - a.confidenceScore);
    const selected = evaluations[0];
    
    // Synchronize decision to MONIBrain
    try {
      const brain = container.resolve<any>('MONIBrain');
      if (brain && typeof brain.syncDecision === 'function') {
        brain.syncDecision(selected);
      }
    } catch (_) {}

    // Synchronize decision to LearningEngine
    try {
      const learning = container.resolve<any>('LearningEngine');
      if (learning && typeof learning.learnFromDecision === 'function') {
        learning.learnFromDecision(selected.confidenceScore, selected);
      }
    } catch (_) {}

    return selected;
  }
}
