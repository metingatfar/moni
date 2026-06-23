import { backupService } from './BackupService';
import { restoreService } from './RestoreService';
import { recoveryMode } from './RecoveryMode';

export class BackupDiagnostics {
  public getDiagnostics() {
    const backupStats = backupService.getDiagnostics();
    const restoreStats = restoreService.getDiagnostics();
    const recoveryStats = recoveryMode.getDiagnostics();

    return {
      lastBackupAt: backupStats.lastBackupAt,
      backupCount: backupStats.backupCount,
      lastBackupSize: backupStats.lastBackupSize,
      lastRestoreAt: restoreStats.lastRestoreAt,
      restoreStatus: restoreStats.restoreStatus,
      checksumStatus: backupStats.checksumStatus,
      recoveryModeStatus: recoveryStats.recoveryModeStatus,
      exportedDataSections: 'LongTermMemory, KnowledgeGraph, Goals, Workflows, CognitiveLearning, ExecutiveState'
    };
  }
}
export const backupDiagnostics = new BackupDiagnostics();
export default backupDiagnostics;
