export type ApprovalStatus = 'Waiting' | 'Approved' | 'Rejected' | 'Expired' | 'Executed';

export interface ApprovalRequest {
  requestId: string;
  taskId: string;
  description: string;
  status: ApprovalStatus;
  createdAt: number;
  decidedAt?: number;
}

export class ApprovalExecutionManager {
  private requests: Map<string, ApprovalRequest> = new Map();

  public createApprovalRequest(taskId: string, description: string): ApprovalRequest {
    const request: ApprovalRequest = {
      requestId: `approve-req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      taskId,
      description,
      status: 'Waiting',
      createdAt: Date.now()
    };
    this.requests.set(request.requestId, request);
    return request;
  }

  public approve(requestId: string): void {
    const req = this.requests.get(requestId);
    if (!req) {
      throw new Error(`Approval request ${requestId} not found`);
    }
    req.status = 'Approved';
    req.decidedAt = Date.now();
  }

  public reject(requestId: string): void {
    const req = this.requests.get(requestId);
    if (!req) {
      throw new Error(`Approval request ${requestId} not found`);
    }
    req.status = 'Rejected';
    req.decidedAt = Date.now();
  }

  public setExecuted(requestId: string): void {
    const req = this.requests.get(requestId);
    if (req) {
      req.status = 'Executed';
    }
  }

  public getPendingRequests(): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter(r => r.status === 'Waiting');
  }

  public getRequestStatus(requestId: string): ApprovalStatus | undefined {
    return this.requests.get(requestId)?.status;
  }

  public getRequest(requestId: string): ApprovalRequest | undefined {
    return this.requests.get(requestId);
  }

  public getAllRequests(): ApprovalRequest[] {
    return Array.from(this.requests.values());
  }

  public autoExpireRequests(): void {
    const expiryWindow = 10 * 60 * 1000; // 10 minutes
    const now = Date.now();
    for (const req of this.requests.values()) {
      if (req.status === 'Waiting' && now - req.createdAt > expiryWindow) {
        req.status = 'Expired';
        req.decidedAt = now;
      }
    }
  }
}
