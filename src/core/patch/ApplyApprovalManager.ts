export interface ApplyApprovalRequest {
  patchId: string;
  isApproved: boolean;
  timestamp?: string;
  riskScore: number;
}

export class ApplyApprovalManager {
  private approvals: Record<string, ApplyApprovalRequest> = {};

  public requestApplyApproval(patchId: string, riskScore: number): ApplyApprovalRequest {
    const req = { patchId, isApproved: false, riskScore };
    this.approvals[patchId] = req;
    return req;
  }

  public approvePatchApply(patchId: string): void {
    if (this.approvals[patchId]) {
      this.approvals[patchId].isApproved = true;
      this.approvals[patchId].timestamp = new Date().toISOString();
    }
  }

  public getApprovalStatus(patchId: string): boolean {
    return this.approvals[patchId]?.isApproved || false;
  }
}

export const applyApprovalManager = new ApplyApprovalManager();
export default applyApprovalManager;
