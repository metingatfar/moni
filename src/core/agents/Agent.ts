import type { AgentContext } from './AgentContext';
import type { AgentResult } from './AgentResult';

export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  canHandle(input: string, context: AgentContext): Promise<boolean>;
  execute(input: string, context: AgentContext): Promise<AgentResult>;
  getDiagnostics(): any;
}
