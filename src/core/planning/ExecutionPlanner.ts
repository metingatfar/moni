export interface RoadmapStep {
  id: string;
  objective: string;
  requiredTool: string;
  requiredAgent: string;
  estimatedDurationMs: number;
  dependencies: string[];
  confirmationRequired: boolean;
  priority: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ProjectRoadmap {
  projectId: string;
  steps: RoadmapStep[];
}

export class ExecutionPlanner {
  public generateRoadmap(projectId: string, taskIds: string[], taskTitles: Record<string, string>, dependencies: Record<string, string[]>): ProjectRoadmap {
    const steps: RoadmapStep[] = [];

    for (const taskId of taskIds) {
      const title = taskTitles[taskId] || 'Genel Görev';
      const deps = dependencies[taskId] || [];
      const lower = title.toLowerCase();

      // Estimate required resources and tool name
      let toolName = 'tasks';
      let agentName = 'WorkAgent';
      let duration = 60000;
      let confirmationRequired = false;

      if (lower.includes('toplantı') || lower.includes('takvim') || lower.includes('calendar')) {
        toolName = 'calendar';
        agentName = 'NotificationAgent';
        duration = 30000;
        confirmationRequired = true;
      } else if (lower.includes('hatırlat') || lower.includes('reminder')) {
        toolName = 'reminders';
        agentName = 'NotificationAgent';
        duration = 15000;
        confirmationRequired = true;
      } else if (lower.includes('hedef') || lower.includes('goals')) {
        toolName = 'goals';
        agentName = 'GoalAgent';
        duration = 45000;
        confirmationRequired = true;
      } else if (lower.includes('workflow') || lower.includes('iş akışı')) {
        toolName = 'workflows';
        agentName = 'GoalAgent';
        duration = 50000;
        confirmationRequired = true;
      } else if (lower.includes('hafıza') || lower.includes('hatırla') || lower.includes('memory')) {
        toolName = 'memory';
        agentName = 'LearningAgent';
        duration = 20000;
        confirmationRequired = true;
      }

      steps.push({
        id: taskId,
        objective: title,
        requiredTool: toolName,
        requiredAgent: agentName,
        estimatedDurationMs: duration,
        dependencies: deps,
        confirmationRequired,
        priority: lower.includes('critical') || lower.includes('db') || lower.includes('auth') ? 'high' : 'medium',
        riskLevel: lower.includes('auth') || lower.includes('hashing') ? 'high' : 'low'
      });
    }

    return {
      projectId,
      steps
    };
  }
}
