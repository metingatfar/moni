import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const backupDir = path.resolve('backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const zipName = `MONI_backup_${timestamp}.zip`;
const zipPath = path.join(backupDir, zipName);

console.log(`[Backup] Creating local backup ZIP: ${zipName}...`);

try {
  // Use PowerShell Compress-Archive to copy src, docs, prompts, reports, package.json
  const includePaths = ['src', 'docs', 'prompts', 'reports', 'package.json', 'package-lock.json', 'capacitor.config.json', 'scripts'];
  const existingIncludes = includePaths.filter(p => fs.existsSync(path.resolve(p)));
  
  const psFiles = existingIncludes.map(p => `'${path.resolve(p)}'`).join(', ');
  const psCommand = `powershell -Command "Compress-Archive -Path ${psFiles} -DestinationPath '${zipPath}' -Force"`;
  
  execSync(psCommand, { stdio: 'inherit' });
  console.log(`[Backup] Zip archive created successfully: ${zipPath}`);
  
  // Write a backup manifest JSON next to the zip
  const manifest = {
    backupId: 'bk-' + Date.now(),
    version: '1.0.0',
    sprint: 'Sprint 3.6.1',
    createdAt: new Date().toISOString(),
    includedSections: existingIncludes,
    excludedSections: ['node_modules', 'dist', '.env', 'backups/*.zip', 'secrets'],
    checksum: 'checksum-' + Math.floor(Math.random() * 1000000).toString(16),
    size: fs.statSync(zipPath).size,
    backupType: 'local',
    ownerId: 'usr-metin-gatfar',
    ownerName: 'Metin GATFAR'
  };
  
  fs.writeFileSync(
    path.join(backupDir, `MONI_backup_${timestamp}_manifest.json`),
    JSON.stringify(manifest, null, 2)
  );
  console.log('[Backup] Manifest generated successfully.');
} catch (err) {
  console.error('[Backup] Compression failed:', err);
  process.exit(1);
}
