export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  status: 'pending' | 'completed';
  deadline: string;
  completedAt?: string;
}
