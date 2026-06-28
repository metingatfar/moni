import type { PatchDraft } from './AutonomousCodeGenerator';

export interface ReviewResult {
  solidCompliant: boolean;
  dryCompliant: boolean;
  kissCompliant: boolean;
  namingCompliant: boolean;
  comments: string[];
}

export class CodeReviewEngine {
  public reviewCode(draft: PatchDraft): ReviewResult {
    const code = draft.patchContent || '';
    const comments: string[] = [];

    const solidCompliant = code.includes('interface') || code.includes('implements');
    const dryCompliant = !code.includes('copy-paste');
    const kissCompliant = code.split('\n').length < 150;
    const namingCompliant = draft.targetFile.includes('/') ? draft.targetFile.split('/').pop()!.match(/^[a-zA-Z]/) !== null : true;

    if (!solidCompliant) comments.push('SOLID: Interface abstraction recommended.');
    if (!kissCompliant) comments.push('KISS: Method length exceeds standard limits.');

    return {
      solidCompliant,
      dryCompliant,
      kissCompliant,
      namingCompliant,
      comments
    };
  }
}

export const codeReviewEngine = new CodeReviewEngine();
export default codeReviewEngine;
