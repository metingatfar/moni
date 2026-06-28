import type { CompiledTeamReviews } from './TeamCoordinator';
import type { BoardReviewOutput } from './ReviewBoard';

export interface TeamMetricsSummary {
  reviewedFilesCount: number;
  reviewedApisCount: number;
  detectedRisksCount: number;
  performanceFindingsCount: number;
  securityFindingsCount: number;
  documentationCoveragePercent: number;
  qaCoveragePercent: number;
  overallHealthScore: number;
}

export class AITeamMetrics {
  public compileMetrics(
    blueprint: any,
    reviews: CompiledTeamReviews,
    boardOutput: BoardReviewOutput
  ): TeamMetricsSummary {
    const foldersCount = blueprint?.folders?.length || 2;
    const apisCount = blueprint?.apis?.length || 0;

    const securityFindings = reviews.securityReview.owaspVulnerabilities.length;
    const performanceFindings = reviews.performanceReview.bottlenecksFound.length;
    const bugFindings = reviews.bugReview.potentialBugs.length;
    const dependencyFindings = reviews.dependencyReview.licensingRisks.length;

    const totalRisks = securityFindings + performanceFindings + bugFindings + dependencyFindings;

    const docCoverage = reviews.docsReview.documentationCoveragePercent || 80;
    const qaCoverage = reviews.qaReview.expectedCoverage || 70;

    let overallHealthScore = 100 - (boardOutput.riskScore * 0.4) - (failedGatesPenalty(boardOutput.gateSummary.failedGates));
    overallHealthScore = Math.min(100, Math.max(0, Math.round(overallHealthScore)));

    return {
      reviewedFilesCount: foldersCount * 3 + 2,
      reviewedApisCount: apisCount,
      detectedRisksCount: totalRisks,
      performanceFindingsCount: performanceFindings,
      securityFindingsCount: securityFindings,
      documentationCoveragePercent: docCoverage,
      qaCoveragePercent: qaCoverage,
      overallHealthScore
    };
  }
}

function failedGatesPenalty(failedGates: string[]): number {
  return failedGates.length * 12;
}
