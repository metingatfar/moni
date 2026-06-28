import { EventBus } from './EventBus';
import { ExecutionCoordinator } from './ExecutionCoordinator';

export class RecoveryCoordinator {
  private recoveryLogs: string[] = [];
  private recoverCount: number = 0;

  public async coordinateRecovery(
    error: Error,
    stepId: string,
    retryFn: () => Promise<any>,
    coordinator: ExecutionCoordinator,
    eventBus: EventBus
  ): Promise<any> {
    this.recoverCount++;
    const log = `Recovery #${this.recoverCount} initiated for step ${stepId}: ${error.message}`;
    this.recoveryLogs.push(log);
    console.warn(`[RecoveryCoordinator] ${log}`);

    eventBus.publish('RecoveryInitiated', { stepId, error: error.message });

    // Step 1: Simulated self-healing analysis
    this.recoveryLogs.push(`Self-healing phase initiated for step ${stepId}`);

    // Step 2: Restore previous checkpoint state
    this.recoveryLogs.push(`Checkpoint restored. Preparing execution retry...`);
    coordinator.rollback(stepId);

    // Step 3: Retry execution with backup limits
    try {
      const result = await retryFn();
      this.recoveryLogs.push(`Recovery successful. Resumed execution workflow.`);
      eventBus.publish('RecoveryCompleted', { stepId });
      return result;
    } catch (e: any) {
      const failLog = `Retry failed during recovery: ${e.message}. Escalating to Human Approval...`;
      this.recoveryLogs.push(failLog);
      eventBus.publish('RecoveryFailed', { stepId, error: e.message });
      throw e;
    }
  }

  public getRecoveryLogs(): string[] {
    return [...this.recoveryLogs];
  }

  public getRecoverCount(): number {
    return this.recoverCount;
  }

  public clear(): void {
    this.recoveryLogs = [];
    this.recoverCount = 0;
  }
}

export const recoveryCoordinatorOS = new RecoveryCoordinator();
export default recoveryCoordinatorOS;
