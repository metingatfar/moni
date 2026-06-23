import { backupService } from './BackupService';

export class RecoveryMode {
  private recoveryActive = false;

  public checkSystemIntegrity(): boolean {
    // Returns true if okay, false if corrupted. We mock as true.
    return !this.recoveryActive;
  }

  public activateRecoveryMode(): void {
    this.recoveryActive = true;
  }

  public getRecoveryInstructions(): string[] {
    const diag = backupService.getDiagnostics();
    return [
      `[RECOVERY MODE] Sistem veri bütünlüğü hatası algıladı!`,
      `Son Sağlam Yerel Yedek: ${diag.lastBackupAt} (Boyut: ${diag.lastBackupSize} bytes)`,
      `Öneri 1: Terminalde 'npm run backup:check' çalıştırarak yedek doğruluğunu test edin.`,
      `Öneri 2: Kod tabanını son commit durumuna çekmek için: 'git reset --hard HEAD'`,
      `Öneri 3: Veri tabanını yedeğe yüklemek için 'Restore' butonuna tıklayın.`
    ];
  }

  public getDiagnostics() {
    return {
      recoveryModeStatus: this.recoveryActive ? 'ACTIVE' : 'INACTIVE'
    };
  }
}
export const recoveryMode = new RecoveryMode();
export default recoveryMode;
