export interface MetricsSummary {
  executedTasksCount: number;
  rollbackCount: number;
  approvalCount: number;
  averageExecutionDurationMs: number;
  successRatePercent: number;
}

export class ExecutionMetrics {
  private totalExecuted = 0;
  private totalSuccess = 0;
  private rollbackCount = 0;
  private approvalCount = 0;
  private totalDurationMs = 0;

  public recordExecution(success: boolean, durationMs: number): void {
    this.totalExecuted++;
    if (success) {
      this.totalSuccess++;
    }
    this.totalDurationMs += durationMs;
  }

  public recordRollback(): void {
    this.rollbackCount++;
  }

  public recordApproval(): void {
    this.approvalCount++;
  }

  public getSummary(): MetricsSummary {
    return {
      executedTasksCount: this.totalExecuted,
      rollbackCount: this.rollbackCount,
      approvalCount: this.approvalCount,
      averageExecutionDurationMs: this.totalExecuted > 0 ? Math.round(this.totalDurationMs / this.totalExecuted) : 0,
      successRatePercent: this.totalExecuted > 0 ? Math.round((this.totalSuccess / this.totalExecuted) * 100) : 100
    };
  }

  public reset(): void {
    this.totalExecuted = 0;
    this.totalSuccess = 0;
    this.rollbackCount = 0;
    this.approvalCount = 0;
    this.totalDurationMs = 0;
  }
}
