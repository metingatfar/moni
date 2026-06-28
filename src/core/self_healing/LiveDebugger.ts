export interface DebugSession {
  sessionId: string;
  targetSubsystem: string;
  status: 'active' | 'completed' | 'paused';
  startedAt: number;
  logs: string[];
}

export class LiveDebugger {
  private sessions = new Map<string, DebugSession>();

  public startSession(sessionId: string, subsystem: string): DebugSession {
    const session: DebugSession = {
      sessionId,
      targetSubsystem: subsystem,
      status: 'active',
      startedAt: Date.now(),
      logs: [`Started debugging session for subsystem: ${subsystem}`]
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  public logEvent(sessionId: string, event: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.logs.push(`[${new Date().toISOString()}] ${event}`);
    }
  }

  public endSession(sessionId: string): DebugSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      session.logs.push('Completed debugging session.');
    }
    return session;
  }

  public getSession(sessionId: string): DebugSession | undefined {
    return this.sessions.get(sessionId);
  }
}
