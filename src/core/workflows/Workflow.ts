import type { WorkflowTrigger } from './WorkflowTrigger';
import type { WorkflowCondition } from './WorkflowCondition';
import type { WorkflowAction } from './WorkflowAction';

export interface Workflow {
  id: string;
  title: string;
  description: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  nextExecution?: string;
  executionCount: number;
  requiresConfirmation: boolean;
}
