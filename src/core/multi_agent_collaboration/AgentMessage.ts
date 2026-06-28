export type AgentMessageType =
  | 'Proposal'
  | 'Review'
  | 'Objection'
  | 'Approval'
  | 'Risk'
  | 'Question'
  | 'Result';

export interface AgentMessage {
  messageId: string;
  fromAgent: string; // agentId
  toAgent: string; // agentId or "all"
  messageType: AgentMessageType;
  content: string;
  confidence: number; // 0-100
  timestamp: string;
}
