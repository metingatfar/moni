export interface OSMetricsSummary {
  totalWorkflows: number;
  runningEnginesCount: number;
  completedWorkflows: number;
  avgExecutionTimeMs: number;
  recoveryCount: number;
  approvalCount: number;
  parallelExecutionCount: number;
  healthScore: number;
}

export class OperatingSystemMetrics {
  private metrics: OSMetricsSummary = {
    totalWorkflows: 0,
    runningEnginesCount: 0,
    completedWorkflows: 0,
    avgExecutionTimeMs: 0,
    recoveryCount: 0,
    approvalCount: 0,
    parallelExecutionCount: 0,
    healthScore: 100
  };

  private totalDurationSum: number = 0;

  public incrementWorkflows(): void {
    this.metrics.totalWorkflows++;
  }

  public setRunningEngines(count: number): void {
    this.metrics.runningEnginesCount = count;
  }

  public recordCompletedWorkflow(durationMs: number): void {
    this.metrics.completedWorkflows++;
    this.totalDurationSum += durationMs;
    this.metrics.avgExecutionTimeMs = Math.round(this.totalDurationSum / this.metrics.completedWorkflows);
  }

  public recordRecovery(): void {
    this.metrics.recoveryCount++;
  }

  public recordApproval(): void {
    this.metrics.approvalCount++;
  }

  public setParallelCount(count: number): void {
    this.metrics.parallelExecutionCount = count;
  }

  public updateHealthScore(score: number): void {
    this.metrics.healthScore = score;
  }

  public getSummary(): OSMetricsSummary {
    return { ...this.metrics };
  }

  public reset(): void {
    this.metrics = {
      totalWorkflows: 0,
      runningEnginesCount: 0,
      completedWorkflows: 0,
      avgExecutionTimeMs: 0,
      recoveryCount: 0,
      approvalCount: 0,
      parallelExecutionCount: 0,
      healthScore: 100
    };
    this.totalDurationSum = 0;
  }
}

export const operatingSystemMetricsOS = new OperatingSystemMetrics();
export default operatingSystemMetricsOS;
