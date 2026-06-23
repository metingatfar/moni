import type { PlannedStep } from './MultiToolPlanner';

export interface ToolExecutionPlan {
  steps: PlannedStep[];
  requiresConfirmation: boolean;
  estimatedCost: number;
  riskScore: 'low' | 'medium' | 'high';
  explanation: string;
}

export class ToolExecutionPlanner {
  public buildExecutionPlan(steps: PlannedStep[]): ToolExecutionPlan {
    let requiresConfirmation = false;
    let estimatedCost = 0;
    
    // Evaluate cost and confirmation requirements
    for (const step of steps) {
      if (step.tool === 'calendar' || step.tool === 'reminders' || step.tool === 'workflows' || step.tool === 'goals' || step.tool === 'memory' || step.tool === 'internet') {
        requiresConfirmation = true; // Confirmation required for these actions
      }

      if (step.tool === 'internet') estimatedCost += 50;
      else if (step.tool === 'calendar') estimatedCost += 10;
      else if (step.tool === 'workflows') estimatedCost += 15;
      else if (step.tool === 'goals') estimatedCost += 12;
      else estimatedCost += 5;
    }

    const riskScore = estimatedCost > 40 ? 'high' : estimatedCost > 15 ? 'medium' : 'low';
    const explanation = `Bu istek için ${steps.length} adım içeren bir plan hazırlandı. Tahmini maliyet: ${estimatedCost} birim. Risk seviyesi: ${riskScore.toUpperCase()}.`;

    return {
      steps,
      requiresConfirmation,
      estimatedCost,
      riskScore,
      explanation
    };
  }
}
