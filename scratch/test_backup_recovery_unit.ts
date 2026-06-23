/// <reference types="node" />

// Mock globals for test environment
const storage: Record<string, string> = {};
const g = globalThis as any;

g.localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, val: string) => { storage[key] = val; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { for (const k in storage) delete storage[k]; },
  length: 0,
  key: (_index: number) => null
};

g.window = {
  dispatchEvent: () => {},
  SpeechRecognition: function() {},
  webkitSpeechRecognition: function() {},
  localStorage: g.localStorage
};

import { container } from '../src/core/container/ServiceContainer';

// Mock LongTermMemory
const mockLtm = {
  getFacts: () => [],
  addFact: async () => 'mock-id',
  deleteFact: async () => true,
  search: () => []
};
container.register('LongTermMemory', mockLtm);

import { bootstrapServices } from '../src/core/container/Bootstrap';
import { BackupConfig } from '../src/core/backup/BackupConfig';
import { BackupManifest } from '../src/core/backup/BackupManifest';
import { dataExportService } from '../src/core/backup/DataExportService';
import { dataImportService } from '../src/core/backup/DataImportService';
import { backupService } from '../src/core/backup/BackupService';
import { restoreService } from '../src/core/backup/RestoreService';
import { recoveryMode } from '../src/core/backup/RecoveryMode';
import { backupDiagnostics } from '../src/core/backup/BackupDiagnostics';
import { ReleaseManifest } from '../src/core/release/ReleaseManifest';
import { releaseManager } from '../src/core/release/ReleaseManager';
import { releaseDiagnostics } from '../src/core/release/ReleaseDiagnostics';
import fs from 'fs';
import path from 'path';

console.log('----------------------------------------------------');
console.log('RUNNING RELEASE & RECOVERY SYSTEM UNIT TESTS (MOCK)');
console.log('----------------------------------------------------');

bootstrapServices();

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  try {
    // 1. BackupConfig exclude list validation
    const config = new BackupConfig();
    assert(config.getExcludePaths().includes('node_modules'), 'BackupConfig excludes node_modules');
    assert(config.getExcludePaths().includes('.env'), 'BackupConfig excludes .env files');

    // 2. BackupManifest schema check
    const manifest: BackupManifest = {
      backupId: 'bk-123',
      version: '1.0.0',
      sprint: 'Sprint 3.6.1',
      createdAt: new Date().toISOString(),
      includedSections: ['src'],
      excludedSections: ['dist'],
      checksum: 'chk-abc',
      size: 456,
      backupType: 'local',
      ownerId: 'usr-1',
      ownerName: 'Metin GATFAR'
    };
    assert(manifest.ownerName === 'Metin GATFAR', 'BackupManifest targets Metin GATFAR');

    // 3. DataExportService section export
    const exportResult = dataExportService.exportAll();
    assert(Array.isArray(exportResult.longTermMemory), 'Exports longTermMemory array');
    assert(exportResult.ownerProfile.ownerName === 'Metin GATFAR', 'Owner name verified in export payload');

    // 4. DataImportService owner identity validation
    const validManifestJson = JSON.stringify(manifest);
    const dataJson = JSON.stringify(exportResult);
    const validationSuccess = dataImportService.validateBackup(validManifestJson, dataJson);
    assert(validationSuccess.valid === false, 'Should fail verification on checksum validation (manifest chk-abc doesn\'t match dataJson computed check)');

    const correctChecksum = dataImportService.calculateMockChecksum(dataJson);
    manifest.checksum = correctChecksum;
    const validationSuccess2 = dataImportService.validateBackup(JSON.stringify(manifest), dataJson);
    assert(validationSuccess2.valid === true, 'Validation passes with correct checksum');

    manifest.ownerName = 'Ahmet Spor';
    const validationFailOwner = dataImportService.validateBackup(JSON.stringify(manifest), dataJson);
    assert(validationFailOwner.valid === false, 'Validation fails if owner name is not Metin GATFAR');
    manifest.ownerName = 'Metin GATFAR'; // Restore

    // 5. BackupService dry-run
    const dryRunResult = await backupService.createBackupDryRun();
    assert(dryRunResult.success === true, 'BackupService dry-run completes successfully');
    assert(dryRunResult.manifest.ownerName === 'Metin GATFAR', 'Dry run manifest contains Metin GATFAR');

    // 6. RestoreService checksum validation
    const restoreResult = await restoreService.restoreBackup(JSON.stringify(manifest), dataJson, true);
    assert(restoreResult.success === true, 'RestoreService completes successfully under push approval');

    const restoreNoApproval = await restoreService.restoreBackup(JSON.stringify(manifest), dataJson, false);
    assert(restoreNoApproval.success === false, 'Restore fails if approval is false');

    // 7. RecoveryMode instructions fallback
    const recoveryInstructions = recoveryMode.getRecoveryInstructions();
    assert(recoveryInstructions.some(i => i.includes('git reset --hard HEAD')), 'Recovery instructions contain git reset tips');

    // 8. BackupDiagnostics output
    const backupDiagStats = backupDiagnostics.getDiagnostics();
    assert(backupDiagStats.recoveryModeStatus === 'INACTIVE', 'Backup diagnostics returns inactive recovery mode initially');

    // 9. ReleaseManifest schema check
    const relManifest: ReleaseManifest = {
      releaseId: 'rel-1',
      sprint: 'Sprint 3.6.1',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      buildStatus: 'success',
      testStatus: 'success',
      backupStatus: 'success',
      gitStatus: 'clean',
      tagName: 'sprint-3.6.1',
      changelogPath: 'docs/release/changelog.md',
      reports: [],
      pushReady: true,
      pushApproved: false
    };
    assert(relManifest.sprint === 'Sprint 3.6.1', 'ReleaseManifest matches current sprint');

    // 10. ReleaseManager dry-run
    const releaseDryRun = await releaseManager.runReleaseDryRun();
    assert(releaseDryRun.success === true, 'ReleaseManager dry run is ok');
    assert(releaseDryRun.manifest.pushReady === true, 'Manifest reports ready for push status');

    // 11. ReleaseDiagnostics output
    const relDiagStats = releaseDiagnostics.getDiagnostics();
    assert(relDiagStats.currentSprint === 'Sprint 3.6.1', 'Release diagnostics reports current sprint');

    // 12. Script existence check
    const scriptFiles = [
      'scripts/backup/local-backup.mjs',
      'scripts/backup/check-backup.mjs',
      'scripts/release/finish-sprint.mjs',
      'scripts/release/push-release.mjs',
      'scripts/release/git-snapshot.mjs'
    ];
    for (const file of scriptFiles) {
      assert(fs.existsSync(path.resolve(file)), `Script file exists: ${file}`);
    }

    // 13. package.json script validation
    const packageJsonPath = path.resolve('package.json');
    const packageContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    assert(packageContent.scripts['backup:local'] !== undefined, 'backup:local script is configured');
    assert(packageContent.scripts['release:finish'] !== undefined, 'release:finish script is configured');

    // 14. .gitignore security validation
    const gitignorePath = path.resolve('.gitignore');
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    assert(gitignoreContent.includes('backups/*.zip'), '.gitignore ignores backup zip files');
    assert(gitignoreContent.includes('secrets/'), '.gitignore ignores secrets directory');

  } catch (err: any) {
    console.error('Test suite failed with error:', err);
    failed++;
  }

  console.log('----------------------------------------------------');
  console.log(`TEST RUN COMPLETED. Passed: ${passed}, Failed: ${failed}`);
  console.log('----------------------------------------------------');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
