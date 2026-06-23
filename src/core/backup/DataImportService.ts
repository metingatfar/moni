import type { BackupManifest } from './BackupManifest';
import type { ExportData } from './DataExportService';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  manifest: BackupManifest | null;
}

export class DataImportService {
  public validateBackup(manifestJson: string, dataJson: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let manifest: BackupManifest | null = null;

    try {
      manifest = JSON.parse(manifestJson) as BackupManifest;
    } catch (_) {
      errors.push('Manifest is not a valid JSON.');
      return { valid: false, errors, warnings, manifest: null };
    }

    // Check version
    if (!manifest.version) {
      warnings.push('Version identifier not found in manifest.');
    }

    // Owner validation
    if (manifest.ownerName !== 'Metin GATFAR') {
      errors.push(`Identity check failed. Expected owner: Metin GATFAR, Found: ${manifest.ownerName}`);
    }

    // Checksum validation
    const computedChecksum = this.calculateMockChecksum(dataJson);
    if (manifest.checksum !== computedChecksum) {
      errors.push(`Checksum mismatch. Manifest: ${manifest.checksum}, Computed: ${computedChecksum}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      manifest
    };
  }

  public dryRunImport(dataJson: string): { success: boolean; recordsLoaded: number; errors: string[] } {
    try {
      const data = JSON.parse(dataJson) as ExportData;
      if (!data.ownerProfile || data.ownerProfile.ownerName !== 'Metin GATFAR') {
        return { success: false, recordsLoaded: 0, errors: ['Owner profile inside export data is mismatch/invalid.'] };
      }
      
      const count = (data.longTermMemory?.length || 0) + 
                    (data.goals?.length || 0) + 
                    (data.workflows?.length || 0) + 
                    (data.cognitiveLearning?.experiences?.length || 0);

      return { success: true, recordsLoaded: count, errors: [] };
    } catch (e: any) {
      return { success: false, recordsLoaded: 0, errors: [e.message || String(e)] };
    }
  }

  public calculateMockChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return 'checksum-' + Math.abs(hash).toString(16);
  }
}
export const dataImportService = new DataImportService();
export default dataImportService;
