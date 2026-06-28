import type { PatchDraftData } from '../codegen/PatchDraft';

export interface ValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
}

export class PatchValidator {
  public validatePatch(drafts: PatchDraftData[]): ValidationResult {
    const errors: string[] = [];
    let score = 100;

    for (const draft of drafts) {
      if (draft.afterSnippet.includes('import ') && !draft.afterSnippet.includes('from')) {
        errors.push(`Syntax error: invalid import structure in ${draft.filePath}`);
        score -= 20;
      }
    }

    return {
      valid: score >= 80,
      score,
      errors
    };
  }
}

export const patchValidator = new PatchValidator();
export default patchValidator;
