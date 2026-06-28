import type { AgentTask } from './AgentTask';
import type { AgentMessage } from './AgentMessage';

export interface CollaborationSession {
  sessionId: string;
  name: string;
  status: 'active' | 'completed' | 'failed';
  assignedTasks: AgentTask[];
  messages: AgentMessage[];
  decisions: string[];
  risksDetected: string[];
  finalOutput?: string;
  collaborationScore: number;
}
