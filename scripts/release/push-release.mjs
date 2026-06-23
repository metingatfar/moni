import readline from 'readline';
import { execSync } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Bu release GitHub\'a gönderilecek. Devam etmek istiyor musunuz? (yes/no): ', (answer) => {
  if (answer.toLowerCase().trim() === 'yes') {
    try {
      console.log('[Release] Pushing commit and tags to origin main...');
      execSync('git push origin main --tags', { stdio: 'inherit' });
      console.log('✅ PASS: Release pushed successfully.');
    } catch (err) {
      console.error('❌ FAIL: Git push command failed.', err);
    }
  } else {
    console.log('[Release] Push command aborted by user.');
  }
  rl.close();
});
