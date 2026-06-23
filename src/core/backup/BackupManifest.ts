export interface BackupManifest {
  backupId: string;
  version: string;
  sprint: string;
  createdAt: string;
  includedSections: string[];
  excludedSections: string[];
  checksum: string;
  size: number;
  backupType: 'local' | 'cloud' | 'manual';
  ownerId: string;
  ownerName: string;
}
