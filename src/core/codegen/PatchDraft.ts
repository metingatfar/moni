export type ChangeType = 'create' | 'update' | 'delete' | 'rename';
export type DraftStatus = 'draft' | 'approved' | 'rejected';

export interface PatchDraftData {
  patchId: string;
  planId: string;
  filePath: string;
  changeType: ChangeType;
  beforeSnippet: string;
  afterSnippet: string;
  explanation: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  requiresApproval: boolean;
  status: DraftStatus;
}

export class PatchDraft {
  public createDraft(planId: string, filePath: string, changeType: ChangeType, afterSnippet: string): PatchDraftData {
    return {
      patchId: 'patch-draft-mock',
      planId,
      filePath,
      changeType,
      beforeSnippet: '// original file content',
      afterSnippet,
      explanation: `Add structure to support ${changeType} operation`,
      riskLevel: 'Medium',
      requiresApproval: true,
      status: 'draft'
    };
  }
}

export const patchDraft = new PatchDraft();
export default patchDraft;
