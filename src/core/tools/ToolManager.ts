import { eventBus } from '../events/EventBus';
import { telemetry } from '../telemetry/Telemetry';
import { stateManager } from '../state/StateManager';

export interface Tool {
  name: string;
  description: string;
  execute(args: any): Promise<any>;
}

export class ToolManager {
  private tools: Map<string, Tool> = new Map();

  public registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
    console.log(`[ToolManager] Registered tool: ${tool.name}`);
  }

  public getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  public getAvailableTools(): { name: string; description: string }[] {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description
    }));
  }

  public async executeTool(name: string, args: any): Promise<any> {
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
    } catch (err: any) {
      const duration = Date.now() - start;
      telemetry.recordLatency(`tool_${name}_failed`, duration);
      eventBus.publish('ToolFailed', { name, args, error: err.message || err, duration });
      throw err;
    }
  }
}

