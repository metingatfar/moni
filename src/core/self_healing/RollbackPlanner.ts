export interface RollbackPlan {
  rollbackId: string;
  targetCheckpointId: string;
  actions: string[];
  estimatedDurationMs: number;
}

export class RollbackPlanner {
  public planRollback(checkpointId: string, errorCategory: string): RollbackPlan {
    const actions: string[] = [];

    if (errorCategory === 'dependency') {
      actions.push('Restore package.json configuration file to previous checkpoint.');
      actions.push('Execute local node_modules dependency installer cleanup.');
    } else {
      actions.push(`Revert in-memory workspace patches using target checkpoint: ${checkpointId}`);
      actions.push('Publish EventBus event to notify OS subsystems of rollback status.');
    }

    return {
      rollbackId: `rollback-${Date.now()}`,
      targetCheckpointId: checkpointId,
      actions,
      estimatedDurationMs: 1500
    };
  }
}
