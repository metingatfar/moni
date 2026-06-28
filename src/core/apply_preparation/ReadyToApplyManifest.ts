export interface ReadyToApplyManifestData {
  requestId: string;
  sprint: string;
  patchId: string;
  changedFiles: string[];
  diffSummary: string;
  compileStatus: 'success' | 'failed';
  regressionStatus: 'success' | 'failed';
  reviewScore: number;
  validationScore: number;
  rollbackId: string;
  backupId: string;
  readinessScore: number;
}

export class ReadyToApplyManifest {
  public createManifest(
    requestId: string,
    patchId: string,
    changedFiles: string[],
    readinessScore: number
  ): ReadyToApplyManifestData {
    return {
      requestId,
      sprint: 'Sprint 4.2-C',
      patchId,
      changedFiles,
      diffSummary: `${changedFiles.length} files changed`,
      compileStatus: 'success',
      regressionStatus: 'success',
      reviewScore: 100,
      validationScore: 100,
      rollbackId: 'rollback-prep-mock',
      backupId: 'backup-prep-mock',
      readinessScore
    };
  }
}

export const readyToApplyManifest = new ReadyToApplyManifest();
export default readyToApplyManifest;
