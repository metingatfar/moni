// ===================================================================
// MONI Sprint 7.0 — WorkflowDesigner.ts
// Interactive designer that builds and validates workflow step configurations.
// ===================================================================

import type { WorkflowPlan, WorkflowStep } from './WorkflowPlanner';

export class WorkflowDesigner {
  designWorkflow(name: string, steps: WorkflowStep[], priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): WorkflowPlan {
    const plan: WorkflowPlan = {
      id: `wf-designed-${Date.now()}`,
      name,
      steps,
      priority,
      createdAt: new Date().toISOString()
    };
    
    const validation = this.validateDesign(plan);
    if (!validation.valid) {
      throw new Error(`Invalid workflow design: ${validation.errors.join(', ')}`);
    }

    return plan;
  }

  validateDesign(plan: WorkflowPlan): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!plan.name || plan.name.trim() === '') {
      errors.push('Workflow name cannot be empty');
    }
    
    if (plan.steps.length === 0) {
      errors.push('Workflow must contain at least one step');
    }

    const stepIds = new Set<string>();
    for (const step of plan.steps) {
      if (stepIds.has(step.stepId)) {
        errors.push(`Duplicate step ID detected: ${step.stepId}`);
      }
      stepIds.add(step.stepId);
    }

    for (const step of plan.steps) {
      for (const dep of step.dependencies) {
        if (!stepIds.has(dep)) {
          errors.push(`Step ${step.stepId} depends on missing step ID: ${dep}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
