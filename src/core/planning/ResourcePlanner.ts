export type PlannerResource =
  | 'GoalEngine'
  | 'WorkflowEngine'
  | 'ToolIntelligence'
  | 'MultiAgent'
  | 'Memory'
  | 'Internet'
  | 'Calendar'
  | 'Reminder'
  | 'Research';

export class ResourcePlanner {
  public determineResources(taskTitle: string): PlannerResource[] {
    const lower = taskTitle.toLowerCase();
    const resources: PlannerResource[] = [];

    // Prioritize specific engines based on intent patterns
    if (lower.includes('hedef') || lower.includes('milestone')) {
      resources.push('GoalEngine');
    }
    
    if (lower.includes('her') || lower.includes('otomatik') || lower.includes('iş akışı')) {
      resources.push('WorkflowEngine');
    }

    if (lower.includes('araştır') || lower.includes('internet') || lower.includes('google')) {
      resources.push('Internet');
      resources.push('Research');
    }

    if (lower.includes('hatırlat') || lower.includes('alarm')) {
      resources.push('Reminder');
    }

    if (lower.includes('toplantı') || lower.includes('randevu') || lower.includes('takvim') || lower.includes('saat')) {
      resources.push('Calendar');
    }

    if (lower.includes('hatırla') || lower.includes('kaydet') || lower.includes('bilgi')) {
      resources.push('Memory');
    }

    // Default general resource
    if (resources.length === 0) {
      resources.push('ToolIntelligence');
    }

    return resources;
  }
}
