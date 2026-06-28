export interface Checkpoint {
  checkpointId: string;
  label: string;
  timestamp: number;
  fileSnapshots: Map<string, string>;
}

export interface DiffResult {
  modifiedFiles: string[];
  addedFiles: string[];
  deletedFiles: string[];
}

export class ExecutionCheckpointManager {
  private checkpoints: Map<string, Checkpoint> = new Map();
  private checkpointHistory: string[] = [];

  public createCheckpoint(label: string, activeSandboxFiles?: Map<string, string>): Checkpoint {
    const checkpointId = `chk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const fileSnapshots = new Map<string, string>();

    if (activeSandboxFiles) {
      for (const [path, content] of activeSandboxFiles.entries()) {
        fileSnapshots.set(path, content);
      }
    }

    const checkpoint: Checkpoint = {
      checkpointId,
      label,
      timestamp: Date.now(),
      fileSnapshots
    };

    this.checkpoints.set(checkpointId, checkpoint);
    this.checkpointHistory.push(checkpointId);
    return checkpoint;
  }

  public getCheckpoint(checkpointId: string): Checkpoint | undefined {
    return this.checkpoints.get(checkpointId);
  }

  public getHistory(): Checkpoint[] {
    return this.checkpointHistory.map(id => this.checkpoints.get(id)!).filter(Boolean);
  }

  public compareCheckpoints(c1Id: string, c2Id: string): DiffResult {
    const c1 = this.checkpoints.get(c1Id);
    const c2 = this.checkpoints.get(c2Id);

    if (!c1 || !c2) {
      throw new Error(`One or both checkpoints not found: ${c1Id}, ${c2Id}`);
    }

    const addedFiles: string[] = [];
    const modifiedFiles: string[] = [];
    const deletedFiles: string[] = [];

    // Compare c1 to c2
    for (const [path, content2] of c2.fileSnapshots.entries()) {
      if (!c1.fileSnapshots.has(path)) {
        addedFiles.push(path);
      } else if (c1.fileSnapshots.get(path) !== content2) {
        modifiedFiles.push(path);
      }
    }

    for (const path of c1.fileSnapshots.keys()) {
      if (!c2.fileSnapshots.has(path)) {
        deletedFiles.push(path);
      }
    }

    return { modifiedFiles, addedFiles, deletedFiles };
  }

  public getSnapshot(checkpointId: string): Record<string, string> {
    const c = this.checkpoints.get(checkpointId);
    if (!c) return {};
    const obj: Record<string, string> = {};
    for (const [path, val] of c.fileSnapshots.entries()) {
      obj[path] = val;
    }
    return obj;
  }
}
