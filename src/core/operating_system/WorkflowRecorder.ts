export interface WorkflowRecord {
  workflowId: string;
  userInput: string;
  startTime: number;
  endTime?: number;
  status: 'running' | 'completed' | 'failed';
  events: Array<{ timestamp: number; event: string; payload?: any }>;
}

export class WorkflowRecorder {
  private records: Map<string, WorkflowRecord> = new Map();
  private activeWorkflowId: string | null = null;

  public startRecord(workflowId: string, userInput: string): void {
    this.activeWorkflowId = workflowId;
    this.records.set(workflowId, {
      workflowId,
      userInput,
      startTime: Date.now(),
      status: 'running',
      events: [{ timestamp: Date.now(), event: 'WorkflowRecordStarted' }]
    });
  }

  public recordEvent(event: string, payload?: any): void {
    if (!this.activeWorkflowId) return;
    const rec = this.records.get(this.activeWorkflowId);
    if (rec) {
      rec.events.push({
        timestamp: Date.now(),
        event,
        payload
      });
    }
  }

  public endRecord(status: 'completed' | 'failed'): void {
    if (!this.activeWorkflowId) return;
    const rec = this.records.get(this.activeWorkflowId);
    if (rec) {
      rec.status = status;
      rec.endTime = Date.now();
      rec.events.push({ timestamp: Date.now(), event: 'WorkflowRecordEnded', payload: { status } });
    }
    this.activeWorkflowId = null;
  }

  public getRecord(workflowId: string): WorkflowRecord | undefined {
    return this.records.get(workflowId);
  }

  public getAllRecords(): WorkflowRecord[] {
    return Array.from(this.records.values());
  }

  public getActiveWorkflowId(): string | null {
    return this.activeWorkflowId;
  }

  public replay(workflowId: string): string[] {
    const rec = this.records.get(workflowId);
    if (!rec) return [];
    return rec.events.map(
      (e) => `[${new Date(e.timestamp).toLocaleTimeString()}] ${e.event} ${e.payload ? JSON.stringify(e.payload) : ''}`
    );
  }

  public clear(): void {
    this.records.clear();
    this.activeWorkflowId = null;
  }
}

export const workflowRecorderOS = new WorkflowRecorder();
export default workflowRecorderOS;
