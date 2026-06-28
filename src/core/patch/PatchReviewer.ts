import type { PatchDraftData } from '../codegen/PatchDraft';

export interface ReviewResult {
  passed: boolean;
  score: number;
  warnings: string[];
}

export class PatchReviewer {
  public reviewPatch(drafts: PatchDraftData[]): ReviewResult {
    const warnings: string[] = [];
    let score = 100;

    for (const draft of drafts) {
      if (draft.filePath === '') {
        warnings.push('Invalid target: file path is empty.');
        score -= 20;
      }
      if (draft.changeType === 'rename' && draft.beforeSnippet === '') {
        warnings.push('Rename operation lacks reference source.');
        score -= 10;
      }
    }

    return {
      passed: score >= 70,
      score,
      warnings
    };
  }
}

export const patchReviewer = new PatchReviewer();
export default patchReviewer;
