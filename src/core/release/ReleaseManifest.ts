export interface ReleaseManifest {
  releaseId: string;
  sprint: string;
  version: string;
  createdAt: string;
  buildStatus: 'success' | 'failed' | 'untested';
  testStatus: 'success' | 'failed' | 'untested';
  backupStatus: 'success' | 'failed' | 'untested';
  gitStatus: string;
  tagName: string;
  changelogPath: string;
  reports: string[];
  pushReady: boolean;
  pushApproved: boolean;
}
