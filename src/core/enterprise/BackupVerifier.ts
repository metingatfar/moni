import { backupSignature } from './BackupSignature';
import { versionManager } from './VersionManager';

export interface VerificationPayload {
  checksum: string;
  signature: string;
  ownerId: string;
  preferredName: string;
  projectId: string;
  schemaVersion: string;
  architectureVersion: string;
  fingerprint: string;
}

export class BackupVerifier {
  public verifyBackup(dataJson: string, payload: VerificationPayload): { valid: boolean; reason?: string } {
    // 1. Checksum
    const computedHash = backupSignature.generateHash(dataJson);
    if (computedHash !== payload.checksum) {
      return { valid: false, reason: 'Checksum verification mismatch.' };
    }

    // 2. Signature verification
    if (!backupSignature.verifySignature(computedHash, payload.signature)) {
      return { valid: false, reason: 'Digital signature signature verify failed.' };
    }

    // 3. Identity validation
    const info = versionManager.getVersionInfo();
    if (payload.ownerId !== info.ownerId || payload.preferredName !== info.preferredName) {
      return { valid: false, reason: `Identity verification mismatch. Found: ${payload.preferredName}` };
    }

    // 4. Compatibility checks
    if (!versionManager.isCompatible(payload.schemaVersion, payload.architectureVersion)) {
      return { valid: false, reason: 'Schema or Architecture version is incompatible.' };
    }

    return { valid: true };
  }
}
export const backupVerifier = new BackupVerifier();
export default backupVerifier;
