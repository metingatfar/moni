import { stateManager } from '../state/StateManager';

export class Telemetry {
  private static instance: Telemetry;

  private constructor() {}

  public static getInstance(): Telemetry {
    if (!Telemetry.instance) {
      Telemetry.instance = new Telemetry();
    }
    return Telemetry.instance;
  }

  public recordLatency(serviceName: string, durationMs: number): void {
    const latencyStr = `${durationMs}ms`;
    console.log(`[Telemetry] Latency recorded for ${serviceName}: ${latencyStr}`);
    stateManager.updateLatency(serviceName, latencyStr);
  }

  public recordTokens(count: number): void {
    console.log(`[Telemetry] Token usage recorded: ${count}`);
    stateManager.recordTokenUsage(count);
  }
}

export const telemetry = Telemetry.getInstance();
