export interface DiagnosticRecord {
  engineStats: Record<string, { success: number; failure: number; avgTimeMs: number }>;
  workflowDurations: Record<string, number>;
  failureSummaries: string[];
  recoveryCount: number;
}

export class SystemDiagnostics {
  private records: DiagnosticRecord = {
    engineStats: {},
    workflowDurations: {},
    failureSummaries: [],
    recoveryCount: 0
  };

  public recordEngineExecution(engine: string, latencyMs: number, success: boolean): void {
    if (!this.records.engineStats[engine]) {
      this.records.engineStats[engine] = { success: 0, failure: 0, avgTimeMs: 0 };
    }
    const stats = this.records.engineStats[engine];
    const total = stats.success + stats.failure;
    stats.avgTimeMs = total === 0 ? latencyMs : Math.round((stats.avgTimeMs * total + latencyMs) / (total + 1));

    if (success) {
      stats.success++;
    } else {
      stats.failure++;
    }
  }

  public recordWorkflowDuration(workflowId: string, durationMs: number): void {
    this.records.workflowDurations[workflowId] = durationMs;
  }

  public addFailure(summary: string): void {
    this.records.failureSummaries.push(summary);
  }

  public setRecoveryCount(count: number): void {
    this.records.recoveryCount = count;
  }

  public getDiagnostics(): DiagnosticRecord {
    return { ...this.records };
  }

  public reset(): void {
    this.records = {
      engineStats: {},
      workflowDurations: {},
      failureSummaries: [],
      recoveryCount: 0
    };
  }
}

export const systemDiagnosticsOS = new SystemDiagnostics();
export default systemDiagnosticsOS;
