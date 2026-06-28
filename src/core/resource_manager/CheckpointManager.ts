export interface StateCheckpoint {
  id: string;
  stageName: string;
  payloadSnapshot: string;
  timestamp: string;
}

export class CheckpointManager {
  private checkpoints: StateCheckpoint[] = [];

  public saveCheckpoint(stageName: string, payload: any): StateCheckpoint {
    const cp: StateCheckpoint = {
      id: `checkpoint-${Date.now()}`,
      stageName,
      payloadSnapshot: JSON.stringify(payload),
      timestamp: new Date().toISOString()
    };
    this.checkpoints.push(cp);
    return cp;
  }

  public getCheckpoints(): StateCheckpoint[] {
    return this.checkpoints;
  }

  public getLatest(): StateCheckpoint | undefined {
    return this.checkpoints[this.checkpoints.length - 1];
  }

  public clear(): void {
    this.checkpoints = [];
  }
}
