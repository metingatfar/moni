// ===================================================================
// MONI Sprint 7.0 — WorkflowPlanner.ts
// Designs sequential, parallel, and conditional execution paths.
// ===================================================================

import type { WorkflowRequest } from './WorkflowEngine';

export interface WorkflowPlan {
  id: string;
  name: string;
  steps: WorkflowStep[];
  priority: 'low' | 'normal' | 'high' | 'critical';
  createdAt: string;
}

export interface WorkflowStep {
  stepId: string;
  type: 'sequential' | 'parallel' | 'conditional' | 'approval';
  action: string;
  dependencies: string[];
}

export class WorkflowPlanner {
  createPlan(request: WorkflowRequest): WorkflowPlan {
    const id = `wf-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Virtual logic based on request parameters
    const steps: WorkflowStep[] = [];
    if (request.name.includes('Deploy')) {
      steps.push({ stepId: 'step-1', type: 'approval', action: 'Request Human Approval', dependencies: [] });
      steps.push({ stepId: 'step-2', type: 'sequential', action: 'Execute Deployment', dependencies: ['step-1'] });
    } else {
      steps.push({ stepId: 'step-1', type: 'sequential', action: 'Process Task', dependencies: [] });
    }

    return {
      id,
      name: request.name,
      steps,
      priority: request.priority || 'normal',
      createdAt: new Date().toISOString()
    };
  }
}
