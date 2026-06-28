export interface AuditEntry {
  timestamp: string;
  action: string;
  sprint: string;
  user: string;
  result: string;
}

export class AuditTrail {
  private logs: AuditEntry[] = [];

  public logAction(action: string, result: string, sprint = 'Sprint 3.6.2', user = 'Metin GATFAR'): void {
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action,
      sprint,
      user,
      result
    };
    this.logs.push(entry);
    console.log(`[AuditTrail] ${action} - Result: ${result}`);
  }

  public getLogs(): AuditEntry[] {
    return [...this.logs];
  }
}
export const auditTrail = new AuditTrail();
export default auditTrail;
