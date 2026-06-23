import fs from 'fs';
import path from 'path';

console.log('=== RUNNING PREBUILD CHECKS ===');

const prodEnvPath = path.resolve('.env.production');
if (!fs.existsSync(prodEnvPath)) {
  console.warn('⚠️ .env.production dosyası bulunamadı! Varsayılan değerler kullanılabilir.');
} else {
  const content = fs.readFileSync(prodEnvPath, 'utf8');
  if (content.includes('localhost') || content.includes('127.0.0.1')) {
    console.error('❌ HATA: .env.production içinde localhost adresi algılandı!');
    console.error('Lütfen canlı sürüm (production build) almadan önce VITE_BACKEND_API_URL adresini production backend adresi olarak güncelleyin.');
    process.exit(1);
  } else {
    console.log('✅ .env.production backend URL kontrolü başarılı.');
  }
}
console.log('=== PREBUILD CHECKS COMPLETED SUCCESSFULLY ===');
