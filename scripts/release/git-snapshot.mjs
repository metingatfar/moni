import { execSync } from 'child_process';

console.log('=== MONI GIT SNAPSHOT ===');

try {
  const branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  console.log(`- Active Branch: ${branchName}`);
  
  const status = execSync('git status --short', { encoding: 'utf8' }).trim();
  console.log(`- Working Directory Status:\n${status || 'Clean'}`);
  
  const tags = execSync('git tag -n', { encoding: 'utf8' }).trim();
  console.log(`- Tags Found:\n${tags || 'No tags found.'}`);
  
  const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
  console.log(`- Last Commit: ${lastCommit}`);
} catch (err) {
  console.error('[Git Snapshot] Failed to fetch git metrics:', err);
}
