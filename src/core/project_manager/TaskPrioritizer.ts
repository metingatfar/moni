import type { PlannedTask } from './TaskDecomposer';
import type { TaskEdge } from './TaskDependencyGraph';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export class TaskPrioritizer {
  public prioritizeTasks(tasks: PlannedTask[], edges: TaskEdge[]): Map<string, TaskPriority> {
    const priorities = new Map<string, TaskPriority>();

    // Database and Security are usually critical or high.
    // Tasks blocking others have higher priority.
    for (const task of tasks) {
      const dependentsCount = edges.filter(e => e.from === task.id).length;
      
      let priority: TaskPriority = 'medium';
      
      if (task.category === 'database' || dependentsCount >= 2) {
        priority = 'critical';
      } else if (task.category === 'security' || task.category === 'api') {
        priority = 'high';
      } else if (task.category === 'testing') {
        priority = 'low';
      }
      
      priorities.set(task.id, priority);
    }

    return priorities;
  }
}

export const taskPrioritizer = new TaskPrioritizer();
export default taskPrioritizer;
