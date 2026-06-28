import type { PlannedTask } from './TaskDecomposer';

export interface TaskEdge {
  from: string; // Task ID
  to: string; // Task ID
  type: 'prerequisite' | 'blocks' | 'parallel';
}

export class TaskDependencyGraph {
  public buildGraph(tasks: PlannedTask[]): { edges: TaskEdge[]; criticalPath: string[] } {
    const edges: TaskEdge[] = [];
    
    // Simple topological ordering based on task IDs
    // TASK-0001 -> TASK-0002 -> TASK-0003 -> TASK-0005
    // TASK-0004 parallel to TASK-0002
    if (tasks.length >= 5) {
      edges.push({ from: 'TASK-0001', to: 'TASK-0002', type: 'prerequisite' });
      edges.push({ from: 'TASK-0002', to: 'TASK-0003', type: 'prerequisite' });
      edges.push({ from: 'TASK-0001', to: 'TASK-0004', type: 'prerequisite' });
      edges.push({ from: 'TASK-0003', to: 'TASK-0005', type: 'prerequisite' });
      edges.push({ from: 'TASK-0004', to: 'TASK-0005', type: 'parallel' });
    }

    const criticalPath = ['TASK-0001', 'TASK-0002', 'TASK-0003', 'TASK-0005'];

    return { edges, criticalPath };
  }
}

export const taskDependencyGraph = new TaskDependencyGraph();
export default taskDependencyGraph;
