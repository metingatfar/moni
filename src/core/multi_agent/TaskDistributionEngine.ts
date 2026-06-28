export interface AgentTaskAssignment {
  taskId: string;
  taskName: string;
  assignedAgent: string;
  mode: 'parallel' | 'sequential' | 'priority';
  priorityLevel: number; // 1 to 5
}

export class TaskDistributionEngine {
  public distributeTasks(
    tasks: Array<{ name: string; priority: number }>,
    availableAgents: string[],
    mode: AgentTaskAssignment['mode']
  ): AgentTaskAssignment[] {
    const assignments: AgentTaskAssignment[] = [];
    if (availableAgents.length === 0 || tasks.length === 0) {
      return [];
    }

    // Sort tasks by priority if priority mode
    let sortedTasks = [...tasks];
    if (mode === 'priority') {
      sortedTasks.sort((a, b) => b.priority - a.priority);
    }

    for (let i = 0; i < sortedTasks.length; i++) {
      const task = sortedTasks[i];
      const agent = availableAgents[i % availableAgents.length];

      assignments.push({
        taskId: `task-${Date.now()}-${i}`,
        taskName: task.name,
        assignedAgent: agent,
        mode,
        priorityLevel: task.priority
      });
    }

    return assignments;
  }
}
