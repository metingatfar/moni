import type { AgentRole } from './AgentRole';

export interface AgentProfile {
  agentId: string;
  role: AgentRole;
  capabilities: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  currentTask?: string;
  availability: boolean;
  lastResult?: string;
}
