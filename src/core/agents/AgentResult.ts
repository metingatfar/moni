export interface AgentResult {
  success: boolean;
  message: string;
  actions: string[];
  events: string[];
  confidence: number;
  requiresConfirmation: boolean;
  suggestedNextSteps: string[];
  toolCalls: {
    tool: string;
    params: any;
  }[];
}
