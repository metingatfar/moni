import type { PatchDraft } from './PatchPlanner';

export interface RegressionAnalysis {
  riskScore: number; // 0 to 100
  potentialBreakages: string[];
  safeToApply: boolean;
}

export class RegressionAnalyzer {
  public analyzeRegression(patch: PatchDraft): RegressionAnalysis {
    const potentialBreakages: string[] = [];
    let riskScore = 10;

    const file = patch.targetFile.toLowerCase();
    if (file.includes('bootstrap') || file.includes('kernel') || file.includes('container')) {
      riskScore = 80;
      potentialBreakages.push('DI Container resolution chain may break downstream services.');
    } else if (file.includes('brain') || file.includes('executive')) {
      riskScore = 65;
      potentialBreakages.push('Executive command routing might fail on keyword matching.');
    } else if (file.includes('dashboard') || file.includes('presentation')) {
      riskScore = 30;
      potentialBreakages.push('Vite build UI assets rendering may have structural styling conflicts.');
    }

    return {
      riskScore,
      potentialBreakages,
      safeToApply: riskScore < 70
    };
  }
}
