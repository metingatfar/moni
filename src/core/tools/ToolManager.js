import { eventBus } from '../events/EventBus';
import { telemetry } from '../telemetry/Telemetry';
import { stateManager } from '../state/StateManager';
export class ToolManager {
    tools = new Map();
    registerTool(tool) {
        this.tools.set(tool.name, tool);
        console.log(`[ToolManager] Registered tool: ${tool.name}`);
    }
    getTool(name) {
        return this.tools.get(name);
    }
    getAvailableTools() {
        return Array.from(this.tools.values()).map(t => ({
            name: t.name,
            description: t.description
        }));
    }
    async executeTool(name, args) {
        const tool = this.tools.get(name);
        if (!tool) {
            const err = new Error(`Tool not found: ${name}`);
            eventBus.publish('ToolFailed', { name, error: err.message });
            throw err;
        }
        console.log(`[ToolManager] Executing tool: ${name} with args:`, args);
        const start = Date.now();
        try {
            const result = await tool.execute(args);
            const duration = Date.now() - start;
            telemetry.recordLatency(`tool_${name}`, duration);
            eventBus.publish('ToolExecuted', { name, args, result, duration });
            stateManager.recordToolExecution(name);
            return result;
        }
        catch (err) {
            const duration = Date.now() - start;
            telemetry.recordLatency(`tool_${name}_failed`, duration);
            eventBus.publish('ToolFailed', { name, args, error: err.message || err, duration });
            throw err;
        }
    }
}
