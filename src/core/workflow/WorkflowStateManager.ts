// ===================================================================
// MONI Sprint 7.0 — WorkflowStateManager.ts
// Controls states (Waiting, Running, Paused, Completed, Failed, Cancelled, Rolled Back).
// ===================================================================

export type WorkflowState = 'Waiting' | 'Running' | 'Paused' | 'Completed' | 'Failed' | 'Cancelled' | 'Rolled Back';

export class WorkflowStateManager {
  private states: Map<string, WorkflowState> = new Map();

  initializeState(workflowId: string, initialState: WorkflowState = 'Waiting'): void {
    this.states.set(workflowId, initialState);
  }

  updateState(workflowId: string, newState: WorkflowState): void {
    this.states.set(workflowId, newState);
  }

  getState(workflowId: string): WorkflowState | undefined {
    return this.states.get(workflowId);
  }

  getAllStates(): Record<string, WorkflowState> {
    return Object.fromEntries(this.states.entries());
  }
}
