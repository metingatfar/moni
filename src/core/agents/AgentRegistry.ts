import type { Agent } from './Agent';

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, Agent> = new Map();

  private constructor() {}

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  public register(agent: Agent): void {
    this.agents.set(agent.id, agent);
    console.log(`[AgentRegistry] Registered agent: ${agent.name} (${agent.id})`);
  }

  public getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  public getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  public clear(): void {
    this.agents.clear();
  }
}
export const agentRegistry = AgentRegistry.getInstance();
