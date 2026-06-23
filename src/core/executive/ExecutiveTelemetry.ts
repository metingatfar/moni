export interface ExecutiveMetrics {
  avgDecisionTimeMs: number;
  avgActiveEnginesCount: number;
  avgReasoningTimeMs: number;
  avgPlanningTimeMs: number;
  avgToolSelectionMs: number;
  avgMemoryAccessMs: number;
  avgVisionTimeMs: number;
  totalExecutions: number;
}

export class ExecutiveTelemetry {
  private metrics: ExecutiveMetrics = {
    avgDecisionTimeMs: 145,
    avgActiveEnginesCount: 5,
    avgReasoningTimeMs: 25,
    avgPlanningTimeMs: 40,
    avgToolSelectionMs: 35,
    avgMemoryAccessMs: 15,
    avgVisionTimeMs: 10,
    totalExecutions: 0
  };

  public recordExecution(decisionTime: number, enginesUsedCount: number): void {
    const n = this.metrics.totalExecutions;
    this.metrics.totalExecutions += 1;
    this.metrics.avgDecisionTimeMs = Math.round((this.metrics.avgDecisionTimeMs * n + decisionTime) / (n + 1));
    this.metrics.avgActiveEnginesCount = Math.round((this.metrics.avgActiveEnginesCount * n + enginesUsedCount) / (n + 1));
  }

  public recordSegment(segment: 'reasoning' | 'planning' | 'tool' | 'memory' | 'vision', timeMs: number): void {
    const n = this.metrics.totalExecutions || 1;
    if (segment === 'reasoning') {
      this.metrics.avgReasoningTimeMs = Math.round((this.metrics.avgReasoningTimeMs * (n - 1) + timeMs) / n);
    } else if (segment === 'planning') {
      this.metrics.avgPlanningTimeMs = Math.round((this.metrics.avgPlanningTimeMs * (n - 1) + timeMs) / n);
    } else if (segment === 'tool') {
      this.metrics.avgToolSelectionMs = Math.round((this.metrics.avgToolSelectionMs * (n - 1) + timeMs) / n);
    } else if (segment === 'memory') {
      this.metrics.avgMemoryAccessMs = Math.round((this.metrics.avgMemoryAccessMs * (n - 1) + timeMs) / n);
    } else if (segment === 'vision') {
      this.metrics.avgVisionTimeMs = Math.round((this.metrics.avgVisionTimeMs * (n - 1) + timeMs) / n);
    }
  }

  public getMetrics(): ExecutiveMetrics {
    return { ...this.metrics };
  }
}
