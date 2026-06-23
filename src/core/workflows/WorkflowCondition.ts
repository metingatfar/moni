export interface WorkflowCondition {
  type: 'goal_progress_less' | 'no_sport_days' | 'blood_pressure_entered' | 'workday_started' | 'keyword_match';
  config: {
    value?: number;
    keyword?: string;
  };
}
