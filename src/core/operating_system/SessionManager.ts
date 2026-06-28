export interface SessionState {
  sessionId: string;
  timestamp: number;
  activeContextSummary: string;
  schedulerQueueSnapshot: string[];
  lastCheckpointStepId: string;
}

export class SessionManager {
  private activeSession: SessionState | null = null;
  private history: SessionState[] = [];

  public createSession(sessionId: string, contextSummary: string): SessionState {
    const session: SessionState = {
      sessionId,
      timestamp: Date.now(),
      activeContextSummary: contextSummary,
      schedulerQueueSnapshot: [],
      lastCheckpointStepId: ''
    };
    this.activeSession = session;
    this.history.push(session);
    return session;
  }

  public saveCheckpoint(stepId: string, queueSnapshot: string[]): void {
    if (this.activeSession) {
      this.activeSession.lastCheckpointStepId = stepId;
      this.activeSession.schedulerQueueSnapshot = [...queueSnapshot];
      this.activeSession.timestamp = Date.now();
    }
  }

  public getSession(): SessionState | null {
    return this.activeSession;
  }

  public resumeSession(): { success: boolean; session?: SessionState } {
    if (this.activeSession && this.activeSession.lastCheckpointStepId) {
      console.log(`[SessionManager] Resuming session ${this.activeSession.sessionId} from checkpoint: ${this.activeSession.lastCheckpointStepId}`);
      return { success: true, session: this.activeSession };
    }
    return { success: false };
  }

  public getHistory(): SessionState[] {
    return [...this.history];
  }

  public clear(): void {
    this.activeSession = null;
    this.history = [];
  }
}

export const sessionManagerOS = new SessionManager();
export default sessionManagerOS;
