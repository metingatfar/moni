import type { PatchDraft } from './PatchPlanner';
import type { RegressionAnalysis } from './RegressionAnalyzer';
import type { RootCause } from './RootCauseAnalyzer';

export interface HealingApprovalPackage {
  packageId: string;
  problemSummary: string;
  rootCause: RootCause;
  regressionAnalysis: RegressionAnalysis;
  patch: PatchDraft;
  confidenceScore: number;
  rollbackPlanId: string;
  rollbackSteps: string[];
}

export class ApprovalPackageGenerator {
  public generateApprovalPackage(
    problemSummary: string,
    rootCause: RootCause,
    regression: RegressionAnalysis,
    patch: PatchDraft,
    rollbackId: string,
    rollbackSteps: string[]
  ): HealingApprovalPackage {
    return {
      packageId: `heal-pkg-${Date.now()}`,
      problemSummary,
      rootCause,
      regressionAnalysis: regression,
      patch,
      confidenceScore: rootCause.confidenceScore,
      rollbackPlanId: rollbackId,
      rollbackSteps
    };
  }
}
