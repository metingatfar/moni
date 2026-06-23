export interface WorkflowTrigger {
  type: 'time' | 'event' | 'memory' | 'goal' | 'conversation' | 'manual' | 'location' | 'health';
  config: {
    cron?: string;
    eventName?: string;
    keyword?: string;
    goalId?: string;
  };
}
