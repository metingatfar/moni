export interface VersionCheckpoint {
  revision: number;
  label: string;
  description: string;
  timestamp: string;
  changedScreens: string[];
}

export class VersionHistoryEngine {
  private checkpoints: VersionCheckpoint[] = [];

  public createCheckpoint(label: string, description: string, changedScreens: string[]): VersionCheckpoint {
    const revision = this.checkpoints.length + 1;
    const checkpoint: VersionCheckpoint = {
      revision,
      label,
      description,
      timestamp: new Date().toISOString(),
      changedScreens
    };
    this.checkpoints.push(checkpoint);
    return checkpoint;
  }

  public getHistory(): VersionCheckpoint[] {
    return this.checkpoints;
  }

  public getCheckpoint(revision: number): VersionCheckpoint | undefined {
    return this.checkpoints.find(c => c.revision === revision);
  }

  public clear(): void {
    this.checkpoints = [];
  }
}
