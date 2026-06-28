import type { ReadyToApplyManifestData } from './ReadyToApplyManifest';
import type { ApplyPreviewData } from './ApplyPreviewEngine';

export interface ApprovalPackage {
  manifest: ReadyToApplyManifestData;
  preview: ApplyPreviewData;
  rollbackPlan: string[];
  backupId: string;
  preparedAt: string;
}

export class ApprovalPackageBuilder {
  public buildPackage(manifest: ReadyToApplyManifestData, preview: ApplyPreviewData): ApprovalPackage {
    return {
      manifest,
      preview,
      rollbackPlan: manifest.changedFiles.map(f => `git checkout -- ${f}`),
      backupId: manifest.backupId,
      preparedAt: new Date().toISOString()
    };
  }
}

export const approvalPackageBuilder = new ApprovalPackageBuilder();
export default approvalPackageBuilder;
