import type { CompiledTeamReviews } from './TeamCoordinator';

export interface BoardReviewOutput {
  status: 'Passed' | 'Needs Review' | 'Rejected';
  riskScore: number; // 0 to 100
  confidenceScore: number; // 0 to 100
  gateSummary: {
    totalGatesChecked: number;
    passedGatesCount: number;
    failedGates: string[];
  };
}

export class ReviewBoard {
  public evaluateReviews(reviews: CompiledTeamReviews): BoardReviewOutput {
    let failedGates: string[] = [];
    let totalGatesChecked = 0;
    let passedGatesCount = 0;

    // 1. Architecture gate
    totalGatesChecked++;
    if (reviews.architectReview.valid) {
      passedGatesCount++;
    } else {
      failedGates.push('ArchitectureGate: Complexity score too high');
    }

    // 2. Security gate
    totalGatesChecked++;
    if (reviews.securityReview.owaspVulnerabilities.length === 0) {
      passedGatesCount++;
    } else {
      failedGates.push(`SecurityGate: Detected ${reviews.securityReview.owaspVulnerabilities.length} vulnerabilities`);
    }

    // 3. Database gate
    totalGatesChecked++;
    if (reviews.databaseReview.normalizationLevel.includes('3NF') || reviews.databaseReview.normalizationLevel.includes('Plan')) {
      passedGatesCount++;
    } else {
      failedGates.push('DatabaseGate: Schema not fully normalized');
    }

    // 4. Quality QA gate
    totalGatesChecked++;
    if (reviews.qaReview.expectedCoverage >= 75) {
      passedGatesCount++;
    } else {
      failedGates.push('QAGate: Expected test coverage below 75%');
    }

    // Compute metrics
    const failedCount = failedGates.length;
    let riskScore = 15; // base risk
    riskScore += failedCount * 25;
    if (reviews.performanceReview.bottlenecksFound.length > 0) riskScore += 10;
    if (reviews.bugReview.potentialBugs.length > 0) riskScore += 15;
    riskScore = Math.min(100, Math.max(0, riskScore));

    let status: BoardReviewOutput['status'] = 'Passed';
    if (failedCount > 2) {
      status = 'Rejected';
    } else if (failedCount > 0 || riskScore > 40) {
      status = 'Needs Review';
    }

    // Average confidence
    const confidenceSum = (
      reviews.architectReview.confidence +
      reviews.backendReview.confidence +
      reviews.frontendReview.confidence +
      reviews.databaseReview.confidence +
      reviews.securityReview.confidence +
      reviews.qaReview.confidence
    );
    const confidenceScore = Math.round((confidenceSum / 6) * 100);

    return {
      status,
      riskScore,
      confidenceScore,
      gateSummary: {
        totalGatesChecked,
        passedGatesCount,
        failedGates
      }
    };
  }
}
