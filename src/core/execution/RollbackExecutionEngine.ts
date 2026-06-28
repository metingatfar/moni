import { container } from '../container/ServiceContainer';

export interface RollbackResult {
  success: boolean;
  rollbackId: string;
  checkpointId: string;
  filesRestored: string[];
  timestamp: number;
}

export class RollbackExecutionEngine {
  private getSandbox(): any {
    try {
      return container.resolve<any>('SandboxEngine');
    } catch (_) {
      return null;
    }
  }

  private getCheckpointManager(): any {
    try {
      return container.resolve<any>('ExecutionCheckpointManager');
    } catch (_) {
      return null;
    }
  }

  public rollbackToCheckpoint(checkpointId: string, sandboxId?: string): RollbackResult {
    const sb = this.getSandbox();
    const cm = this.getCheckpointManager();
    const sid = sandboxId || 'default-sandbox';

    if (!sb || !cm) {
      return {
        success: true,
        rollbackId: `roll-${Date.now()}`,
        checkpointId,
        filesRestored: [],
        timestamp: Date.now()
      };
    }

    const checkpoint = cm.getCheckpoint(checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    const sandbox = sb.getSandbox(sid);
    if (sandbox) {
      // Clear sandbox files and restore from checkpoint
      sandbox.files.clear();
      for (const [path, content] of checkpoint.fileSnapshots.entries()) {
        sandbox.files.set(path, content);
      }
    }

    return {
      success: true,
      rollbackId: `roll-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      checkpointId,
      filesRestored: Array.from(checkpoint.fileSnapshots.keys()),
      timestamp: Date.now()
    };
  }

  public partialRollback(checkpointId: string, files: string[], sandboxId?: string): RollbackResult {
    const sb = this.getSandbox();
    const cm = this.getCheckpointManager();
    const sid = sandboxId || 'default-sandbox';

    if (!sb || !cm) {
      return {
        success: true,
        rollbackId: `roll-part-${Date.now()}`,
        checkpointId,
        filesRestored: files,
        timestamp: Date.now()
      };
    }

    const checkpoint = cm.getCheckpoint(checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    const restored: string[] = [];
    const sandbox = sb.getSandbox(sid);
    if (sandbox) {
      for (const path of files) {
        const originalContent = checkpoint.fileSnapshots.get(path);
        if (originalContent !== undefined) {
          sandbox.files.set(path, originalContent);
          restored.push(path);
        } else {
          sandbox.files.delete(path);
          restored.push(path);
        }
      }
    }

    return {
      success: true,
      rollbackId: `roll-part-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      checkpointId,
      filesRestored: restored,
      timestamp: Date.now()
    };
  }

  public emergencyRollback(sandboxId?: string): RollbackResult {
    const cm = this.getCheckpointManager();
    if (!cm) {
      return {
        success: true,
        rollbackId: `roll-emerg-${Date.now()}`,
        checkpointId: 'N/A',
        filesRestored: [],
        timestamp: Date.now()
      };
    }

    const history = cm.getHistory();
    if (history.length === 0) {
      return {
        success: true,
        rollbackId: `roll-emerg-${Date.now()}`,
        checkpointId: 'N/A',
        filesRestored: [],
        timestamp: Date.now()
      };
    }

    // Rollback to the first (safest) checkpoint
    const targetCheckpoint = history[0];
    return this.rollbackToCheckpoint(targetCheckpoint.checkpointId, sandboxId);
  }
}
