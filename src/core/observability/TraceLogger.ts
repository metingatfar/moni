import type { PipelineTrace } from './PipelineTracer';

export class TraceLogger {
  private logs: PipelineTrace[] = [];
  private maxLogs = 50;

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('moni_trace_logs');
        if (stored) {
          this.logs = JSON.parse(stored);
        }
      }
    } catch (e) {
      console.warn('[TraceLogger] LocalStorage read failed:', e);
    }
  }

  private saveLogs() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('moni_trace_logs', JSON.stringify(this.logs));
      }
    } catch (e: any) {
      // Handle localStorage quota exceeded
      if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.code === 1014) {
        console.warn('[TraceLogger] LocalStorage quota exceeded. Trimming old logs...');
        // Remove oldest half of logs and retry
        const trimCount = Math.max(Math.floor(this.logs.length / 2), 5);
        this.logs = this.logs.slice(0, this.logs.length - trimCount);
        try {
          localStorage.setItem('moni_trace_logs', JSON.stringify(this.logs));
        } catch (retryErr) {
          console.error('[TraceLogger] LocalStorage write failed after trim:', retryErr);
          // Clear all logs as last resort — never crash the app
          this.logs = [];
          try {
            localStorage.removeItem('moni_trace_logs');
          } catch (_) {}
        }
      } else {
        console.warn('[TraceLogger] LocalStorage write failed:', e);
      }
    }
  }

  public logTrace(trace: PipelineTrace): void {
    // Add requestId and sessionId if not present
    const enhancedTrace = {
      ...trace,
      sessionId: 'session-' + new Date().toISOString().substring(0, 10),
      timestamp: new Date().toISOString()
    };
    this.logs.unshift(enhancedTrace);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    this.saveLogs();
  }

  public getTraces(): PipelineTrace[] {
    return this.logs;
  }

  public clearLogs(): void {
    this.logs = [];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('moni_trace_logs');
      }
    } catch (e) {
      console.warn('[TraceLogger] LocalStorage clear failed:', e);
    }
  }
}

export const traceLogger = new TraceLogger();
