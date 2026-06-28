export interface RollbackSnapshot {
  snapshotId: string;
  timestamp: string;
  sprint: string;
  changedFiles: string[];
  instructions: string[];
}

export class RollbackManager {
  private checkpoints: RollbackSnapshot[] = [];

  public createCheckpoint(files: string[]): RollbackSnapshot {
    const checkpoint: RollbackSnapshot = {
      snapshotId: 'snap-' + Date.now(),
      timestamp: new Date().toISOString(),
      sprint: 'Sprint 4.2-B',
      changedFiles: files,
      instructions: files.map(file => `git checkout -- ${file}`)
    };
    this.checkpoints.push(checkpoint);
    return checkpoint;
  }

  public getCheckpoints(): RollbackSnapshot[] {
    return [...this.checkpoints];
  }
}

export const rollbackManager = new RollbackManager();
export default rollbackManager;
