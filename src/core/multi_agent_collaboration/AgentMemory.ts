export interface CollaborationRecord {
  sessionId: string;
  agentsParticipated: string[];
  success: boolean;
  score: number;
  conflictsCount: number;
  timestamp: string;
}

export class AgentMemory {
  private records: CollaborationRecord[] = [];

  public recordCollaboration(record: CollaborationRecord): void {
    this.records.push(record);
  }

  public getCollaborationHistory(): CollaborationRecord[] {
    return this.records;
  }

  public getPreferredCombinations(): string[][] {
    // Simply return combinations of agents that achieved a high score (> 90)
    return this.records
      .filter(r => r.success && r.score > 90)
      .map(r => r.agentsParticipated);
  }

  public clear(): void {
    this.records = [];
  }
}

export const agentMemory = new AgentMemory();
export default agentMemory;
