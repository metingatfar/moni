export interface AgentTask {
  taskId: string;
  title: string;
  description: string;
  assignedAgent?: string; // agentId
  dependencies: string[]; // taskId list
  status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: string; // e.g. "10 mins"
  result?: string;
}
