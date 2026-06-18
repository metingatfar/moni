import { watch } from 'fs';
import { exec } from 'child_process';
import { join } from 'path';

const GIT_PATH = 'C:\\Progra~1\\Git\\cmd\\git.exe';
const REPO_DIR = process.cwd();

console.log('====================================================');
console.log('   MONI OTOMATIK GÖNDERİCİ (AUTO-PUSH) BAŞLATILDI   ');
console.log('====================================================');
console.log('İzlenen Klasör:', REPO_DIR);
console.log('Değişiklik yapıldığında otomatik olarak GitHub\'a push edilecektir.');
console.log('Not: İlk yüklemede GitHub giriş penceresi açılabilir.');
console.log('----------------------------------------------------');

let debounceTimeout = null;

const runGitCommands = () => {
  const timestamp = new Date().toLocaleString('tr-TR');
  const commitMessage = `Moni Otomatik Guncelleme: ${timestamp}`;

  exec(`"${GIT_PATH}" add .`, { cwd: REPO_DIR }, (err, stdout, stderr) => {
    if (err) {
      console.error('Git add hatası:', err);
      return;
    }
    
    exec(`"${GIT_PATH}" commit -m "${commitMessage}"`, { cwd: REPO_DIR }, (err, stdout, stderr) => {
      // Check if there are changes to commit
      if (err) {
        // If git commit returns error because nothing to commit
        if (stderr.includes('nothing to commit') || stdout.includes('nothing to commit')) {
          return;
        }
      }
      
      console.log(`[${timestamp}] Değişiklikler kaydedildi. GitHub'a gönderiliyor...`);
      
      exec(`"${GIT_PATH}" push origin main`, { cwd: REPO_DIR }, (err, stdout, stderr) => {
        if (err) {
          console.error('\n[HATA] Git push başarısız oldu!');
          console.error('Neden: GitHub kimlik doğrulaması (giriş) yapılmamış olabilir.');
          console.error('Çözüm: Lütfen terminalde manuel olarak "git push origin main" yazarak giriş yapın veya VS Code üzerinden "Sync Changes" tıklayın.\n');
          return;
        }
        console.log(`[${timestamp}] Buluta başarıyla gönderildi! Render derlemesi tetiklendi.`);
      });
    });
  });
};

// Watch src and public folders recursively
const watchOptions = { recursive: true };

try {
  watch(join(REPO_DIR, 'src'), watchOptions, (eventType, filename) => {
    if (filename && !filename.includes('.git') && !filename.includes('node_modules')) {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(runGitCommands, 5000); // 5 seconds debounce
    }
  });

  watch(join(REPO_DIR, 'public'), watchOptions, (eventType, filename) => {
    if (filename && !filename.includes('.git') && !filename.includes('node_modules')) {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(runGitCommands, 5000); // 5 seconds debounce
    }
  });
} catch (e) {
  console.error("Klasör izleme hatası:", e);
}
