import type { Milestone } from './Milestone';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  deadline: string;
  status: 'active' | 'completed' | 'abandoned';
  progress: number;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedDuration?: string;
  requiresConfirmation: boolean;
}
