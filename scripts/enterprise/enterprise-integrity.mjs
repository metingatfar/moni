import { integrityScanner } from '../../src/core/enterprise/IntegrityScanner.ts';

const integrity = integrityScanner.scanProject();
console.log('--- Integrity Scan Results ---');
console.log(`Integrity Score: ${integrity.score}/100`);
console.log(`Corrupted Files Found: ${integrity.corruptedFiles.length}`);
console.log(`Missing Files Found: ${integrity.missingFiles.join(', ') || 'None'}`);
console.log(`Invalid Manifests: ${integrity.invalidManifests.length}`);
console.log(`Broken References Count: ${integrity.brokenReferencesCount}`);
console.log(`Orphan Data Count: ${integrity.orphanDataCount}`);
console.log(`Configuration Mismatch: ${integrity.configurationMismatch}`);

if (integrity.score < 90) {
  console.error('System Integrity Failed: score is below 90%.');
  process.exit(1);
} else {
  console.log('System Integrity OK.');
}
