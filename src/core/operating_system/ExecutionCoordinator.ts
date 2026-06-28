import type { WorkflowStep } from './WorkflowPlanner';
import { EventBus } from './EventBus';

export interface Checkpoint {
  stepId: string;
  timestamp: number;
  engineStateSummary: string;
}

export class ExecutionCoordinator {
  private checkpoints: Checkpoint[] = [];
  private currentProgress: number = 0;

  public async coordinateStep(
    step: WorkflowStep,
    executeFn: () => Promise<any>,
    eventBus: EventBus
  ): Promise<any> {
    const startTime = Date.now();
    eventBus.publish('StepExecutionStarted', { stepId: step.id, engine: step.engineName });

    try {
      // Timeout boundary safety logic
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout exceeded for step: ${step.id}`)), 30000)
      );
      const executionPromise = executeFn();

      const result = await Promise.race([executionPromise, timeoutPromise]);

      step.status = 'completed';
      const latency = Date.now() - startTime;

      // Save success checkpoint trace
      this.checkpoints.push({
        stepId: step.id,
        timestamp: Date.now(),
        engineStateSummary: `Success execution of ${step.engineName}.${step.actionName} in ${latency}ms`
      });

      eventBus.publish('StepExecutionCompleted', { stepId: step.id, engine: step.engineName, latency });
      return result;
    } catch (e: any) {
      step.status = 'failed';
      eventBus.publish('StepExecutionFailed', { stepId: step.id, engine: step.engineName, error: e.message || String(e) });
      throw e;
    }
  }

  public getCheckpoints(): Checkpoint[] {
    return [...this.checkpoints];
  }

  public setProgress(progress: number): void {
    this.currentProgress = progress;
  }

  public getProgress(): number {
    return this.currentProgress;
  }

  public rollback(stepId: string): void {
    // Perform rollback execution simulation
    this.checkpoints = this.checkpoints.filter((c) => c.stepId !== stepId);
  }

  public clear(): void {
    this.checkpoints = [];
    this.currentProgress = 0;
  }
}

export const executionCoordinatorOS = new ExecutionCoordinator();
export default executionCoordinatorOS;
