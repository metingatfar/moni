import crypto from 'crypto';
import { versionManager } from './VersionManager';

export class ProjectFingerprint {
  public generateFingerprint(): string {
    const info = versionManager.getVersionInfo();
    const payload = `${info.appVersion}-${info.architectureVersion}-${info.projectId}-${info.ownerId}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  public verifyFingerprint(fingerprint: string): boolean {
    const computed = this.generateFingerprint();
    return computed === fingerprint;
  }
}
export const projectFingerprint = new ProjectFingerprint();
export default projectFingerprint;
