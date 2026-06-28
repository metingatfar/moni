export interface CollaborationKPIs {
  activeSessions: number;
  completedSessions: number;
  averageConfidence: number;
  disagreementRate: number; // 0 - 100
  taskCompletionRate: number; // 0 - 100
  collaborationQualityScore: number; // 0 - 100
}

export class CollaborationMetrics {
  private activeSessionsCount = 0;
  private completedSessionsCount = 0;
  private confidenceScores: number[] = [];
  private totalConflicts = 0;
  private totalDecisions = 0;
  private totalTasks = 0;
  private completedTasks = 0;

  public incrementActiveSessions(): void {
    this.activeSessionsCount++;
  }

  public completeSession(confidence: number): void {
    if (this.activeSessionsCount > 0) this.activeSessionsCount--;
    this.completedSessionsCount++;
    this.confidenceScores.push(confidence);
  }

  public trackTasks(total: number, completed: number): void {
    this.totalTasks += total;
    this.completedTasks += completed;
  }

  public trackConflicts(conflicts: number, decisions: number): void {
    this.totalConflicts += conflicts;
    this.totalDecisions += decisions;
  }

  public getKPIs(): CollaborationKPIs {
    const avgConfidence = this.confidenceScores.length > 0 
      ? Math.round(this.confidenceScores.reduce((a, b) => a + b, 0) / this.confidenceScores.length)
      : 92;

    const disagreementRate = this.totalDecisions > 0
      ? Math.round((this.totalConflicts / this.totalDecisions) * 100)
      : 12;

    const taskCompletionRate = this.totalTasks > 0
      ? Math.round((this.completedTasks / this.totalTasks) * 100)
      : 95;

    const collaborationQualityScore = Math.max(0, Math.min(100, avgConfidence - disagreementRate + (taskCompletionRate * 0.1)));

    return {
      activeSessions: this.activeSessionsCount,
      completedSessions: this.completedSessionsCount,
      averageConfidence: avgConfidence,
      disagreementRate,
      taskCompletionRate,
      collaborationQualityScore: Math.round(collaborationQualityScore)
    };
  }

  public clear(): void {
    this.activeSessionsCount = 0;
    this.completedSessionsCount = 0;
    this.confidenceScores = [];
    this.totalConflicts = 0;
    this.totalDecisions = 0;
    this.totalTasks = 0;
    this.completedTasks = 0;
  }
}

export const collaborationMetrics = new CollaborationMetrics();
export default collaborationMetrics;
