// ===================================================================
// MONI Sprint 7.0 — WorkflowMetrics.ts
// Collects execution counts, durations, failures, and throughput KPIs.
// ===================================================================

export class WorkflowMetrics {
  private metrics = {
    totalSubmissions: 0,
    totalCompleted: 0,
    totalFailed: 0,
    totalDurationMs: 0
  };

  recordSubmission(): void {
    this.metrics.totalSubmissions++;
  }

  recordSuccess(durationMs: number): void {
    this.metrics.totalCompleted++;
    this.metrics.totalDurationMs += durationMs;
  }

  recordFailure(): void {
    this.metrics.totalFailed++;
  }

  getMetrics(): any {
    return {
      ...this.metrics,
      averageDurationMs: this.metrics.totalCompleted > 0 ? this.metrics.totalDurationMs / this.metrics.totalCompleted : 0,
      successRate: this.metrics.totalSubmissions > 0 ? (this.metrics.totalCompleted / this.metrics.totalSubmissions) * 100 : 0
    };
  }
}
