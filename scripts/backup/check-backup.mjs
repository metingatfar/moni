import fs from 'fs';
import path from 'path';

const backupDir = path.resolve('backups');
if (!fs.existsSync(backupDir)) {
  console.log('[Check Backup] No backups folder found.');
  process.exit(0);
}

const files = fs.readdirSync(backupDir);
const manifests = files.filter(f => f.endsWith('_manifest.json'));

if (manifests.length === 0) {
  console.log('[Check Backup] No backup manifest found.');
  process.exit(0);
}

// Get latest manifest
manifests.sort();
const latestManifestFile = manifests[manifests.length - 1];
const latestManifestPath = path.join(backupDir, latestManifestFile);

console.log(`[Check Backup] Validating latest manifest: ${latestManifestFile}...`);

try {
  const content = fs.readFileSync(latestManifestPath, 'utf8');
  const manifest = JSON.parse(content);

  console.log(`- Backup ID: ${manifest.backupId}`);
  console.log(`- Sprint: ${manifest.sprint}`);
  console.log(`- Size: ${manifest.size} bytes`);
  console.log(`- Checksum: ${manifest.checksum}`);
  console.log(`- Owner: ${manifest.ownerName}`);

  if (manifest.ownerName !== 'Metin GATFAR') {
    console.error('❌ FAIL: Identity validation mismatch! Expected owner Metin GATFAR.');
    process.exit(1);
  }

  console.log('✅ PASS: Manifest verification successful.');
} catch (err) {
  console.error('❌ FAIL: Failed to parse manifest:', err);
  process.exit(1);
}
