import type { BackupManifest } from './BackupManifest';
import { dataExportService } from './DataExportService';
import { dataImportService } from './DataImportService';

export class BackupService {
  private backupCount = 0;
  private lastBackupManifest: BackupManifest | null = null;

  public async createBackupDryRun(): Promise<{ success: boolean; manifest: BackupManifest }> {
    const data = dataExportService.exportAll();
    const dataJson = JSON.stringify(data);
    const checksum = dataImportService.calculateMockChecksum(dataJson);
    
    const manifest: BackupManifest = {
      backupId: 'bk-' + Date.now(),
      version: '1.0.0',
      sprint: 'Sprint 3.6.1',
      createdAt: new Date().toISOString(),
      includedSections: ['src', 'docs', 'prompts', 'reports'],
      excludedSections: ['node_modules', 'dist', '.env', 'backups/*.zip'],
      checksum,
      size: dataJson.length,
      backupType: 'local',
      ownerId: 'usr-metin-gatfar',
      ownerName: 'Metin GATFAR'
    };

    return {
      success: true,
      manifest
    };
  }

  public recordBackupCompletion(manifest: BackupManifest): void {
    this.backupCount += 1;
    this.lastBackupManifest = manifest;
  }

  public getDiagnostics() {
    return {
      backupCount: this.backupCount,
      lastBackupAt: this.lastBackupManifest?.createdAt || 'Never',
      lastBackupSize: this.lastBackupManifest?.size || 0,
      checksumStatus: this.lastBackupManifest ? 'Valid' : 'None'
    };
  }
}
export const backupService = new BackupService();
export default backupService;
