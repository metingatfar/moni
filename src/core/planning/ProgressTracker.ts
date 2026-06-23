export type StepState = 'Waiting' | 'Ready' | 'Running' | 'Blocked' | 'Completed' | 'Failed';

export interface StepProgress {
  stepId: string;
  state: StepState;
}

export class ProgressTracker {
  private progressMap: Map<string, StepState> = new Map();

  public initializeSteps(stepIds: string[]): void {
    for (const id of stepIds) {
      this.progressMap.set(id, 'Waiting');
    }
  }

  public updateStepState(stepId: string, state: StepState): void {
    this.progressMap.set(stepId, state);
  }

  public getStepState(stepId: string): StepState {
    return this.progressMap.get(stepId) || 'Waiting';
  }

  public calculateCompletionPercentage(): number {
    if (this.progressMap.size === 0) return 0;
    let completedCount = 0;
    for (const state of this.progressMap.values()) {
      if (state === 'Completed') {
        completedCount++;
      }
    }
    return Math.round((completedCount / this.progressMap.size) * 100);
  }

  public getBlockedStepsCount(): number {
    let count = 0;
    for (const state of this.progressMap.values()) {
      if (state === 'Blocked') count++;
    }
    return count;
  }

  public getCompletedStepsCount(): number {
    let count = 0;
    for (const state of this.progressMap.values()) {
      if (state === 'Completed') count++;
    }
    return count;
  }

  public getAllProgress(): StepProgress[] {
    return Array.from(this.progressMap.entries()).map(([stepId, state]) => ({
      stepId,
      state
    }));
  }

  public clear(): void {
    this.progressMap.clear();
  }
}
