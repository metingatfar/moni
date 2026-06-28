import type { PatchDraftData } from './PatchDraft';

export interface SafetyCheckResult {
  passed: boolean;
  safetyScore: number;
  warnings: string[];
}

export class PatchSafetyChecker {
  public checkPatchSafety(drafts: PatchDraftData[]): SafetyCheckResult {
    const warnings: string[] = [];
    let safetyScore = 100;

    for (const draft of drafts) {
      if (draft.filePath.includes('src/core/brain') || draft.filePath.includes('src/core/executive')) {
        warnings.push(`Core engine file modified: ${draft.filePath}`);
        safetyScore -= 20;
      }
      if (draft.changeType === 'delete') {
        warnings.push(`Destructive operation detected on file: ${draft.filePath}`);
        safetyScore -= 30;
      }
      if (draft.riskLevel === 'High') {
        warnings.push(`High risk level assigned to: ${draft.filePath}`);
        safetyScore -= 10;
      }
    }

    return {
      passed: safetyScore >= 60,
      safetyScore: Math.max(0, safetyScore),
      warnings
    };
  }
}

export const patchSafetyChecker = new PatchSafetyChecker();
export default patchSafetyChecker;
