import { execSync } from 'child_process';

console.log('=== RUNNING FINISH SPRINT PIPELINE ===');

try {
  console.log('\nStep 1: Running build...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\nStep 2: Running backup & recovery unit tests...');
  execSync('npx tsx scratch/test_backup_recovery_unit.ts', { stdio: 'inherit' });

  console.log('\nStep 3: Creating local backup...');
  execSync('npm run backup:local', { stdio: 'inherit' });

  console.log('\nStep 4: Running git status check...');
  execSync('git status', { stdio: 'inherit' });

  console.log('\nStep 5: Git staging files...');
  execSync('git add .', { stdio: 'inherit' });

  console.log('\nStep 6: Creating git commit...');
  execSync('git commit -m "Sprint 3.6.1 completed" --allow-empty', { stdio: 'inherit' });

  console.log('\nStep 7: Creating release tag...');
  // Delete tag if already exists to avoid conflict
  try { execSync('git tag -d sprint-3.6.1', { stdio: 'ignore' }); } catch (_) {}
  execSync('git tag sprint-3.6.1', { stdio: 'inherit' });

  console.log('\n=======================================');
  console.log('Sprint hazırlandı.');
  console.log('Build başarılı.');
  console.log('Testler geçti.');
  console.log('Backup oluşturuldu.');
  console.log('Commit oluşturuldu.');
  console.log('Tag oluşturuldu.');
  console.log('\nGitHub\'a push etmek için onay gerekiyor.');
  console.log('\nDevam etmek için:');
  console.log('npm run release:push');
  console.log('=======================================');

} catch (err) {
  console.error('\n❌ Sprint finish pipeline aborted due to error:', err);
  process.exit(1);
}
