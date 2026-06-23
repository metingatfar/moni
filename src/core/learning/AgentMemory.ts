export interface AgentMemoryItem {
  agentId: string;
  lastUsedAt: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  acceptedCount: number;
  rejectedCount: number;
  averageConfidence: number;
  averageExecutionTime: number;
  learnedPatterns: string[];
}

export class AgentMemory {
  private memory: Map<string, AgentMemoryItem> = new Map();

  constructor() {
    this.loadMemory();
  }

  private loadMemory(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('moni_agent_memory');
        if (stored) {
          const parsed = JSON.parse(stored);
          Object.keys(parsed).forEach(k => this.memory.set(k, parsed[k]));
        }
      }
    } catch (e) {
      console.error('[AgentMemory] Failed to load agent memory:', e);
    }
  }

  private saveMemory(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const obj: Record<string, AgentMemoryItem> = {};
        this.memory.forEach((v, k) => { obj[k] = v; });
        localStorage.setItem('moni_agent_memory', JSON.stringify(obj));
      }
    } catch (e) {
      console.error('[AgentMemory] Failed to save agent memory:', e);
    }
  }

  public getOrCreate(agentId: string): AgentMemoryItem {
    let item = this.memory.get(agentId);
    if (!item) {
      item = {
        agentId,
        lastUsedAt: '',
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        averageConfidence: 0.8, // base starting confidence
        averageExecutionTime: 0,
        learnedPatterns: []
      };
      this.memory.set(agentId, item);
      this.saveMemory();
    }
    return item;
  }

  public update(agentId: string, updates: Partial<AgentMemoryItem>): void {
    const item = this.getOrCreate(agentId);
    const updated = { ...item, ...updates };
    this.memory.set(agentId, updated);
    this.saveMemory();
  }

  public getAll(): AgentMemoryItem[] {
    return Array.from(this.memory.values());
  }

  public clear(): void {
    this.memory.clear();
    this.saveMemory();
  }
}

export const agentMemory = new AgentMemory();
