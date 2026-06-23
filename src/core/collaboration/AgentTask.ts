import type { AgentContext } from '../agents/AgentContext';

export interface AgentTask {
  id: string;
  input: string;
  intent: string;
  context: AgentContext;
  requiredAgents: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}
