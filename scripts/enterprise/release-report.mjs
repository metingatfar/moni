import { releaseManager } from '../../src/core/release/ReleaseManager.ts';

console.log('--- MONI Release Dry Run & Report ---');
const dryRun = await releaseManager.runReleaseDryRun();
if (dryRun.success) {
  console.log('Release Dry Run Passed!');
} else {
  console.error('Release Dry Run Failed!');
}
console.log('\nManifest details:');
console.log(JSON.stringify(dryRun.manifest, null, 2));
