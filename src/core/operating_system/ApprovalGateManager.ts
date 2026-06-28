export interface ApprovalPackage {
  id: string;
  stepId: string;
  engineName: string;
  proposedChangesSummary: string;
  timestamp: number;
  approved: boolean | null;
}

export class ApprovalGateManager {
  private approvals: Map<string, ApprovalPackage> = new Map();

  public createGate(stepId: string, engineName: string, summary: string): ApprovalPackage {
    const pkg: ApprovalPackage = {
      id: `gate-${stepId}-${Date.now()}`,
      stepId,
      engineName,
      proposedChangesSummary: summary,
      timestamp: Date.now(),
      approved: null
    };
    this.approvals.set(pkg.id, pkg);
    return pkg;
  }

  public approve(gateId: string): void {
    const pkg = this.approvals.get(gateId);
    if (pkg) {
      pkg.approved = true;
    }
  }

  public reject(gateId: string): void {
    const pkg = this.approvals.get(gateId);
    if (pkg) {
      pkg.approved = false;
    }
  }

  public getStatus(gateId: string): boolean | null {
    const pkg = this.approvals.get(gateId);
    return pkg ? pkg.approved : null;
  }

  public getAllGates(): ApprovalPackage[] {
    return Array.from(this.approvals.values());
  }

  public clear(): void {
    this.approvals.clear();
  }
}

export const approvalGateManagerOS = new ApprovalGateManager();
export default approvalGateManagerOS;
