// ===================================================================
// MONI Sprint 7.0 — WorkflowHealthEngine.ts
// Diagnostics, monitoring, and state tracking for active workflows.
// ===================================================================

import type { WorkflowStateManager } from './WorkflowStateManager';

export interface WorkflowHealthReport {
  score: number;
  active: number;
  hung: number;
  failed: number;
  status: 'Healthy' | 'Warning' | 'Critical';
  checkedAt: string;
}

export class WorkflowHealthEngine {
  private stateManager: WorkflowStateManager;

  constructor(stateManager: WorkflowStateManager) {
    this.stateManager = stateManager;
  }

  getHealthReport(): WorkflowHealthReport {
    const states = this.stateManager.getAllStates();
    let active = 0;
    let failed = 0;
    let hung = 0;
    const total = Object.keys(states).length;

    for (const [_, state] of Object.entries(states)) {
      if (state === 'Running') active++;
      if (state === 'Failed') failed++;
      // Mock detection of hung steps (simulated)
      if (state === 'Running' && Math.random() < 0.05) hung++;
    }

    let score = 100;
    if (total > 0) {
      score -= (failed / total) * 30;
      score -= (hung / total) * 50;
      score = Math.max(0, Math.round(score));
    }

    let status: 'Healthy' | 'Warning' | 'Critical' = 'Healthy';
    if (score < 60) status = 'Critical';
    else if (score < 90) status = 'Warning';

    return {
      score,
      active,
      hung,
      failed,
      status,
      checkedAt: new Date().toISOString()
    };
  }
}
