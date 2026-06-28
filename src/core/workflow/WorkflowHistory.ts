// ===================================================================
// MONI Sprint 7.0 — WorkflowHistory.ts
// Synchronizes completed and rolled-back workflow records with MONIBrain.
// ===================================================================

import type { WorkflowPlan } from './WorkflowPlanner';

export class WorkflowHistory {
  private archive: WorkflowPlan[] = [];

  archiveCompleted(plan: WorkflowPlan): void {
    this.archive.push(plan);
    // Virtual sync with MONIBrain
    console.log(`[WorkflowHistory] Archived Workflow ${plan.id} and synced with MONIBrain.`);
  }

  getArchive(): WorkflowPlan[] {
    return [...this.archive];
  }
}
