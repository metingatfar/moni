import type { PatchDraft } from './PatchPlanner';

export interface ValidationOutput {
  valid: boolean;
  score: number; // 0 to 100
  errors: string[];
}

export class PatchValidator {
  public validatePatch(patch: PatchDraft): ValidationOutput {
    const errors: string[] = [];
    let score = 100;

    if (!patch.targetFile.endsWith('.ts') && !patch.targetFile.endsWith('.tsx') && !patch.targetFile.endsWith('.js')) {
      errors.push('ArchitectureGate: Source file format invalid');
      score -= 30;
    }

    if (patch.patchContent.includes('eval(')) {
      errors.push('SecurityGate: Found dangerous eval statement');
      score -= 40;
    }

    if (patch.patchContent.includes('require(') && patch.targetFile.endsWith('.ts')) {
      errors.push('DependencyGate: Found CommonJS require imports in ES module target');
      score -= 20;
    }

    return {
      valid: errors.length === 0,
      score,
      errors
    };
  }
}
