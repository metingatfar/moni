export interface ProfilerMetric {
  moduleName: string;
  totalDurationMs: number;
  callCount: number;
  averageDurationMs: number;
  maxDurationMs: number;
  minDurationMs: number;
}

export class PerformanceProfiler {
  private metrics: Record<string, ProfilerMetric> = {};

  constructor() {
    this.resetMetrics();
  }

  public resetMetrics(): void {
    const modules = [
      'ExecutiveBrain',
      'Memory',
      'Conversation',
      'LifeModel',
      'Goal',
      'Workflow',
      'Agent',
      'MultiAgent',
      'Learning',
      'LLM',
      'TTS',
      'STT'
    ];
    this.metrics = {};
    for (const m of modules) {
      this.metrics[m] = {
        moduleName: m,
        totalDurationMs: 0,
        callCount: 0,
        averageDurationMs: 0,
        maxDurationMs: 0,
        minDurationMs: Infinity
      };
    }
  }

  public recordDuration(moduleName: string, durationMs: number): void {
    // Standardize module keys if possible
    let key = moduleName;
    if (moduleName === 'ExecutiveBrain') key = 'ExecutiveBrain';
    else if (moduleName.toLowerCase().includes('memory')) key = 'Memory';
    else if (moduleName.toLowerCase().includes('conversation')) key = 'Conversation';
    else if (moduleName.toLowerCase().includes('life')) key = 'LifeModel';
    else if (moduleName.toLowerCase().includes('goal')) key = 'Goal';
    else if (moduleName.toLowerCase().includes('workflow')) key = 'Workflow';
    else if (moduleName.toLowerCase().includes('agentmanager') || moduleName === 'Agent') key = 'Agent';
    else if (moduleName.toLowerCase().includes('multiagent')) key = 'MultiAgent';
    else if (moduleName.toLowerCase().includes('learning')) key = 'Learning';
    else if (moduleName.toLowerCase().includes('llm') || moduleName.toLowerCase().includes('provider')) key = 'LLM';
    else if (moduleName.toLowerCase().includes('tts')) key = 'TTS';
    else if (moduleName.toLowerCase().includes('stt')) key = 'STT';

    if (!this.metrics[key]) {
      this.metrics[key] = {
        moduleName: key,
        totalDurationMs: 0,
        callCount: 0,
        averageDurationMs: 0,
        maxDurationMs: 0,
        minDurationMs: Infinity
      };
    }

    const metric = this.metrics[key];
    metric.callCount++;
    metric.totalDurationMs += durationMs;
    metric.averageDurationMs = Math.round((metric.totalDurationMs / metric.callCount) * 100) / 100;
    if (durationMs > metric.maxDurationMs) {
      metric.maxDurationMs = durationMs;
    }
    if (durationMs < metric.minDurationMs) {
      metric.minDurationMs = durationMs;
    }
  }

  public getMetrics(): ProfilerMetric[] {
    return Object.values(this.metrics).filter(m => m.callCount > 0);
  }

  public getSlowestModule(): string {
    let slowest = 'None';
    let maxAvg = -1;
    for (const m of Object.values(this.metrics)) {
      if (m.callCount > 0 && m.averageDurationMs > maxAvg) {
        maxAvg = m.averageDurationMs;
        slowest = m.moduleName;
      }
    }
    return slowest;
  }

  public getFastestModule(): string {
    let fastest = 'None';
    let minAvg = Infinity;
    for (const m of Object.values(this.metrics)) {
      if (m.callCount > 0 && m.averageDurationMs < minAvg) {
        minAvg = m.averageDurationMs;
        fastest = m.moduleName;
      }
    }
    return fastest === 'None' ? 'None' : fastest;
  }

  public getAverageResponseTime(): number {
    let total = 0;
    let count = 0;
    // We can estimate overall or look at ExecutiveBrain
    for (const m of Object.values(this.metrics)) {
      if (m.moduleName === 'MultiAgent' || m.moduleName === 'Agent') {
        total += m.totalDurationMs;
        count += m.callCount;
      }
    }
    return count > 0 ? Math.round(total / count) : 250; // default mock fallback
  }
}

export const performanceProfiler = new PerformanceProfiler();
