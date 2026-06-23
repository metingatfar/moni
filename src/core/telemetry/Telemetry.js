import { stateManager } from '../state/StateManager';
export class Telemetry {
    static instance;
    constructor() { }
    static getInstance() {
        if (!Telemetry.instance) {
            Telemetry.instance = new Telemetry();
        }
        return Telemetry.instance;
    }
    recordLatency(serviceName, durationMs) {
        const latencyStr = `${durationMs}ms`;
        console.log(`[Telemetry] Latency recorded for ${serviceName}: ${latencyStr}`);
        stateManager.updateLatency(serviceName, latencyStr);
    }
    recordTokens(count) {
        console.log(`[Telemetry] Token usage recorded: ${count}`);
        stateManager.recordTokenUsage(count);
    }
}
export const telemetry = Telemetry.getInstance();
