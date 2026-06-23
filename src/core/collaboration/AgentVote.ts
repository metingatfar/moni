export interface AgentVote {
  agentId: string;
  confidence: number;
  summary: string;
  risk: string;
  suggestedActions: {
    tool: string;
    params: any;
  }[];
  executionTime: number;
}
