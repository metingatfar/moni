export interface CollaborationMetricsSummary {
  activeAgentsCount: number;
  collaborationSessionsCount: number;
  agreementRatioPercent: number;
  conflictRatioPercent: number;
  averageDecisionTimeMinutes: number;
  engineeringConfidencePercent: number;
}

export class CollaborationMetrics {
  private sessionsCount = 0;
  private conflictsCount = 0;
  private decisionsCount = 0;
  private durationSum = 0;
  private confidenceSum = 0;

  public recordSession(durationMinutes: number, confidence: number, conflicts: number, decisions: number): void {
    this.sessionsCount++;
    this.conflictsCount += conflicts;
    this.decisionsCount += decisions;
    this.durationSum += durationMinutes;
    this.confidenceSum += confidence;
  }

  public getSummary(activeAgentsCount: number = 5): CollaborationMetricsSummary {
    const avgTime = this.sessionsCount > 0 ? Math.round(this.durationSum / this.sessionsCount) : 10;
    const avgConfidence = this.sessionsCount > 0 ? Math.round(this.confidenceSum / this.sessionsCount) : 92;
    const conflictRatio = this.decisionsCount > 0 ? Math.round((this.conflictsCount / this.decisionsCount) * 100) : 12;

    return {
      activeAgentsCount,
      collaborationSessionsCount: this.sessionsCount,
      agreementRatioPercent: 100 - conflictRatio,
      conflictRatioPercent: conflictRatio,
      averageDecisionTimeMinutes: avgTime,
      engineeringConfidencePercent: avgConfidence
    };
  }

  public clear(): void {
    this.sessionsCount = 0;
    this.conflictsCount = 0;
    this.decisionsCount = 0;
    this.durationSum = 0;
    this.confidenceSum = 0;
  }
}
