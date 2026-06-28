export interface ApprovalRequest {
  requestId: string;
  isApproved: boolean;
  timestamp?: string;
}

export class UserApprovalManager {
  private approvals: Record<string, ApprovalRequest> = {};

  public requestApproval(requestId: string): ApprovalRequest {
    const req = { requestId, isApproved: false };
    this.approvals[requestId] = req;
    return req;
  }

  public approveRequest(requestId: string): void {
    if (this.approvals[requestId]) {
      this.approvals[requestId].isApproved = true;
      this.approvals[requestId].timestamp = new Date().toISOString();
    }
  }

  public getApprovalStatus(requestId: string): boolean {
    return this.approvals[requestId]?.isApproved || false;
  }
}

export const userApprovalManager = new UserApprovalManager();
export default userApprovalManager;
