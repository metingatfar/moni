import { backupVerifier } from '../../src/core/enterprise/BackupVerifier.ts';
import { backupSignature } from '../../src/core/enterprise/BackupSignature.ts';
import { versionManager } from '../../src/core/enterprise/VersionManager.ts';
import { projectFingerprint } from '../../src/core/enterprise/ProjectFingerprint.ts';

const data = JSON.stringify({ longTermMemory: [] });
const checksum = backupSignature.generateHash(data);
const signature = backupSignature.signPayload(checksum);
const info = versionManager.getVersionInfo();
const fingerprint = projectFingerprint.generateFingerprint();

const payload = {
  checksum,
  signature,
  ownerId: info.ownerId,
  preferredName: info.preferredName,
  projectId: info.projectId,
  schemaVersion: info.schemaVersion,
  architectureVersion: info.architectureVersion,
  fingerprint
};

console.log('Verifying backup payload...');
const result = backupVerifier.verifyBackup(data, payload);
if (result.valid) {
  console.log('Backup Verification Passed.');
} else {
  console.error('Backup Verification Failed:', result.reason);
  process.exit(1);
}
