import type { PatchDraftData } from '../codegen/PatchDraft';

export interface DiffStatistics {
  changedFiles: number;
  addedLines: number;
  removedLines: number;
  modifiedBlocks: number;
}

export interface DiffReportData {
  statistics: DiffStatistics;
  unifiedDiffs: Array<{ file: string; diff: string }>;
}

export class DiffGenerator {
  public generateDiffs(drafts: PatchDraftData[]): DiffReportData {
    const unifiedDiffs = drafts.map(draft => {
      return {
        file: draft.filePath,
        diff: `--- ${draft.filePath} (Original)\n+++ ${draft.filePath} (Patched)\n@@ -1,1 +1,4 @@\n-${draft.beforeSnippet}\n+${draft.afterSnippet}`
      };
    });

    return {
      statistics: {
        changedFiles: drafts.length,
        addedLines: drafts.length * 4,
        removedLines: drafts.length * 1,
        modifiedBlocks: drafts.length
      },
      unifiedDiffs
    };
  }
}

export const diffGenerator = new DiffGenerator();
export default diffGenerator;
