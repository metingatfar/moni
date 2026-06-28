import type { PatchDraftData } from '../codegen/PatchDraft';

export interface ApplyPreviewData {
  affectedFiles: string[];
  estimatedChanges: number;
  diffSummary: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  compileResult: 'success' | 'failed';
  regressionResult: 'success' | 'failed';
  estimatedExecutionTimeMs: number;
}

export class ApplyPreviewEngine {
  public generatePreview(drafts: PatchDraftData[]): ApplyPreviewData {
    return {
      affectedFiles: drafts.map(d => d.filePath),
      estimatedChanges: drafts.length,
      diffSummary: `${drafts.length} files staged for update`,
      riskLevel: 'Medium',
      compileResult: 'success',
      regressionResult: 'success',
      estimatedExecutionTimeMs: 1200
    };
  }
}

export const applyPreviewEngine = new ApplyPreviewEngine();
export default applyPreviewEngine;
