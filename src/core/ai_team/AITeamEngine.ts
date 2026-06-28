import { TeamCoordinator } from './TeamCoordinator';
import type { CompiledTeamReviews } from './TeamCoordinator';
import { ReviewBoard } from './ReviewBoard';
import { AITeamMetrics } from './AITeamMetrics';
import type { TeamMetricsSummary } from './AITeamMetrics';
import { AITeamReport } from './AITeamReport';
import { AIProjectManager } from './AIProjectManager';
import type { TaskAssignment } from './AIProjectManager';
import { ConflictResolver } from './ConflictResolver';
import type { ConflictResolution } from './ConflictResolver';

export interface TeamReviewPackage {
  success: boolean;
  projectName: string;
  verdict: 'Passed' | 'Needs Review' | 'Rejected';
  riskScore: number;
  confidenceScore: number;
  metrics: TeamMetricsSummary;
  tasks: TaskAssignment[];
  disputes: ConflictResolution[];
  reviews: CompiledTeamReviews;
  reportContent: string;
}

export class AITeamEngine {
  private coordinator = new TeamCoordinator();
  private board = new ReviewBoard();
  private metrics = new AITeamMetrics();
  private reporter = new AITeamReport();
  private pm = new AIProjectManager();
  private resolver = new ConflictResolver();

  public async runTeamReview(blueprint: any): Promise<TeamReviewPackage> {
    const projectName = blueprint?.projectName || 'UnnamedApp';

    // 1. Plan assignments
    const tasks = this.pm.createTaskAssignments(blueprint);

    // 2. Perform concurrent agent reviews
    const reviews = this.coordinator.compileTeamReviews(blueprint);

    // 3. Resolve potential disputes
    const disputes: ConflictResolution[] = [];
    
    // Simulating developer team conflicts
    if (blueprint?.database?.tables?.length > 5) {
      const dbConflict = this.resolver.resolveConflict(
        'Database indexing model',
        'DatabaseArchitectAgent',
        0.93,
        'Add strict composite index models on foreign keys.',
        'LeadArchitectAgent',
        0.85,
        'Delay database indexes until after the scaffolding prototype.'
      );
      disputes.push(dbConflict);
    }

    if (blueprint?.targetPlatform?.toLowerCase().includes('mobile')) {
      const platformConflict = this.resolver.resolveConflict(
        'UI Framework Selection',
        'MobileDeveloperAgent',
        0.88,
        'Use Flutter for cross-platform components layout rendering.',
        'FrontendDeveloperAgent',
        0.82,
        'Use React Native with styled components wrapper.'
      );
      disputes.push(platformConflict);
    }

    // 4. Board evaluation
    const boardOutput = this.board.evaluateReviews(reviews);

    // 5. Gather team metrics
    const teamMetrics = this.metrics.compileMetrics(blueprint, reviews, boardOutput);

    // 6. Generate final report content
    const reportContent = this.reporter.generateMainReport(reviews, boardOutput, teamMetrics);
    
    // Write all 17 reports to disk
    this.reporter.writeAllReports(reviews, boardOutput, teamMetrics);

    // Mark tasks completed after audit
    tasks.forEach(t => {
      this.pm.updateStatus(t.agentName, 'Completed');
    });

    return {
      success: boardOutput.status !== 'Rejected',
      projectName,
      verdict: boardOutput.status,
      riskScore: boardOutput.riskScore,
      confidenceScore: boardOutput.confidenceScore,
      metrics: teamMetrics,
      tasks,
      disputes,
      reviews,
      reportContent
    };
  }
}

export const aiTeamEngine = new AITeamEngine();
export default aiTeamEngine;
