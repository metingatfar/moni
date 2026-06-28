// ===================================================================
// MONI Sprint 7.0 — WorkflowVersionManager.ts
// Governs tracking, rollbacks, and upgrades of workflow schemas.
// ===================================================================

import type { WorkflowPlan } from './WorkflowPlanner';

export interface WorkflowVersionRecord {
  workflowId: string;
  version: string;
  plan: WorkflowPlan;
  timestamp: string;
}

export class WorkflowVersionManager {
  private versions: Map<string, WorkflowVersionRecord[]> = new Map();

  registerVersion(workflowId: string, version: string, plan: WorkflowPlan): void {
    const history = this.versions.get(workflowId) || [];
    history.push({
      workflowId,
      version,
      plan: JSON.parse(JSON.stringify(plan)), // Deep clone
      timestamp: new Date().toISOString()
    });
    this.versions.set(workflowId, history);
  }

  getLatestVersion(workflowId: string): WorkflowVersionRecord | undefined {
    const history = this.versions.get(workflowId);
    if (!history || history.length === 0) return undefined;
    return history[history.length - 1];
  }

  getVersionHistory(workflowId: string): WorkflowVersionRecord[] {
    return this.versions.get(workflowId) || [];
  }

  migrate(workflowId: string, targetVersion: string): WorkflowPlan {
    const current = this.getLatestVersion(workflowId);
    if (!current) {
      throw new Error(`Workflow ${workflowId} not found in version registry.`);
    }

    console.log(`[WorkflowVersionManager] Migrating workflow ${workflowId} from version ${current.version} to ${targetVersion}`);
    
    // Simulate migration logic
    const migratedPlan = JSON.parse(JSON.stringify(current.plan));
    migratedPlan.name = `${migratedPlan.name} (Migrated to v${targetVersion})`;
    
    this.registerVersion(workflowId, targetVersion, migratedPlan);
    return migratedPlan;
  }
}
