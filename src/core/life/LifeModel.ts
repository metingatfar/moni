import { initialLifeProfile } from './LifeProfile';
import type { LifeProfileData } from './LifeProfile';
import type { LifeSnapshot } from './LifeSnapshot';
import { calculateMetrics } from './LifeMetrics';
import type { LifeMetrics } from './LifeMetrics';
import { lifeAnalyzer } from './LifeAnalyzer';

export class LifeModel {
  private profile: LifeProfileData;
  private snapshot: LifeSnapshot;
  private metrics: LifeMetrics;
  private lastAnalysisTime: number = 0;
  private throttleIntervalMs: number = 5000; // 5 seconds throttle

  constructor() {
    this.profile = { ...initialLifeProfile };
    this.snapshot = {
      todayTasksCount: 0,
      activeGoalsCount: 0,
      lastSportDate: null,
      lastWeight: null,
      lastBP: null,
      upcomingMeetings: [],
      lastConversationTopic: 'chat',
      lastUsedTool: null,
      activeConversationMode: 'normal',
      memoryCount: 0,
      conversationCount: 0,
      timestamp: new Date().toISOString()
    };
    this.metrics = calculateMetrics(this.profile, this.snapshot);
  }

  /**
   * Triggers the analysis engine with throttling
   */
  public async analyze(force: boolean = false): Promise<void> {
    const now = Date.now();
    if (!force && now - this.lastAnalysisTime < this.throttleIntervalMs) {
      console.log('[LifeModel] Skipping analysis due to throttling.');
      return;
    }

    try {
      const result = await lifeAnalyzer.analyze(this.profile);
      this.profile = result.profile;
      this.snapshot = result.snapshot;

      // Sync active & completed goals from GoalEngine if registered
      let goalEngine: any = null;
      try {
        const { container } = await import('../container/ServiceContainer');
        goalEngine = container.resolve<any>('GoalEngine');
      } catch (err) {}

      if (goalEngine) {
        const goals = goalEngine.getGoals();
        this.profile.goals.activeGoals = goals.filter((g: any) => g.status === 'active').map((g: any) => g.title);
        this.profile.goals.completedGoals = goals.filter((g: any) => g.status === 'completed').map((g: any) => g.title);
        this.snapshot.activeGoalsCount = this.profile.goals.activeGoals.length;
        
        // Let's also trigger GoalEngine analyze with the snapshot
        goalEngine.analyze(this.snapshot, true);
      }

      this.metrics = calculateMetrics(this.profile, this.snapshot);
      
      let workflowEngine: any = null;
      try {
        const { container } = await import('../container/ServiceContainer');
        workflowEngine = container.resolve<any>('WorkflowEngine');
      } catch (err) {}

      if (workflowEngine) {
        const diag = workflowEngine.getDiagnostics();
        this.metrics.consistencyScore = diag.workflowSuccessRate;
      }

      if (goalEngine) {
        const diag = goalEngine.getDiagnostics(this.snapshot);
        this.metrics.goalProgressScore = diag.goalScore;
      }

      if (goalEngine || workflowEngine) {
        this.metrics.overallLifeScore = Math.round(
          (this.metrics.healthScore +
            this.metrics.activityScore +
            this.metrics.productivityScore +
            this.metrics.consistencyScore +
            this.metrics.memoryUsageScore +
            this.metrics.conversationQualityScore +
            this.metrics.goalProgressScore) /
            7
        );
      }
      this.lastAnalysisTime = now;
      console.log('[LifeModel] Analysis completed successfully.');
    } catch (e) {
      console.error('[LifeModel] Analysis failed:', e);
    }
  }

  public getProfile(): LifeProfileData {
    return this.profile;
  }

  public getSnapshot(): LifeSnapshot {
    return this.snapshot;
  }

  public getMetrics(): LifeMetrics {
    return this.metrics;
  }

  public getProfileCompleteness(): number {
    // Calculate the percentage of non-empty fields in the profile
    let filledFields = 0;
    let totalFields = 10;

    if (this.profile.identity.name) filledFields++;
    if (this.profile.health.weight || this.profile.health.systolicBP) filledFields++;
    if (this.profile.health.conditions.length > 0 || this.profile.health.medications.length > 0) filledFields++;
    if (this.profile.sports.activities.length > 0) filledFields++;
    if (this.profile.goals.activeGoals.length > 0) filledFields++;
    if (this.profile.work.company || this.profile.work.role) filledFields++;
    if (this.profile.location.homeAddress || this.profile.location.officeAddress) filledFields++;
    if (this.profile.calendar.upcomingMeetings.length > 0) filledFields++;
    if (this.profile.relationships.length > 0) filledFields++;
    if (Object.keys(this.profile.preferences).length > 0) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
  }

  public getDiagnostics() {
    return {
      healthScore: this.metrics.healthScore,
      activityScore: this.metrics.activityScore,
      goalScore: this.metrics.goalProgressScore,
      productivityScore: this.metrics.productivityScore,
      overallLifeScore: this.metrics.overallLifeScore,
      lastSnapshotTime: this.lastAnalysisTime ? new Date(this.lastAnalysisTime).toISOString() : 'Never',
      snapshotSize: JSON.stringify(this.snapshot).length,
      profileCompleteness: this.getProfileCompleteness()
    };
  }
}
