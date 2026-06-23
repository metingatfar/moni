export interface TraceStep {
  moduleName: string;
  status: 'started' | 'completed' | 'failed';
  timestamp: number;
  durationMs?: number;
  error?: string;
}

export interface PipelineTrace {
  requestId: string;
  input: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  steps: TraceStep[];
  outputSummary?: string;
  status: 'running' | 'completed' | 'failed';
}

export class PipelineTracer {
  private currentTrace: PipelineTrace | null = null;
  private stepTimestamps: Record<string, number> = {};

  public startTrace(requestId: string, input: string): PipelineTrace {
    this.currentTrace = {
      requestId,
      input,
      startTime: Date.now(),
      steps: [],
      status: 'running'
    };
    this.stepTimestamps = {};
    // Automatically trace starting ExecutiveBrain
    this.traceStep('ExecutiveBrain', 'started');
    return this.currentTrace;
  }

  public traceStep(moduleName: string, status: 'started' | 'completed' | 'failed', error?: string): void {
    if (!this.currentTrace) return;

    const now = Date.now();
    const step: TraceStep = {
      moduleName,
      status,
      timestamp: now,
      error
    };

    if (status === 'started') {
      this.stepTimestamps[moduleName] = now;
    } else {
      const start = this.stepTimestamps[moduleName];
      if (start) {
        step.durationMs = now - start;
      }
    }

    this.currentTrace.steps.push(step);
    if (error) {
      this.currentTrace.status = 'failed';
    }
  }

  public endTrace(outputSummary: string): PipelineTrace | null {
    if (!this.currentTrace) return null;

    const now = Date.now();
    this.currentTrace.endTime = now;
    this.currentTrace.durationMs = now - this.currentTrace.startTime;
    this.currentTrace.outputSummary = outputSummary;
    if (this.currentTrace.status === 'running') {
      this.currentTrace.status = 'completed';
    }

    // Automatically trace completing ExecutiveBrain
    this.traceStep('ExecutiveBrain', this.currentTrace.status === 'completed' ? 'completed' : 'failed');

    const completedTrace = this.currentTrace;
    // Keep it as last trace but reset for next
    return completedTrace;
  }

  public getCurrentTrace(): PipelineTrace | null {
    return this.currentTrace;
  }
}

export const pipelineTracer = new PipelineTracer();
