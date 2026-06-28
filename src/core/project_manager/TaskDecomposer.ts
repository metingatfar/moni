export interface PlannedTask {
  id: string; // e.g. TASK-0001
  title: string;
  description: string;
  category: 'database' | 'api' | 'ui' | 'testing' | 'security' | 'architecture';
}

export class TaskDecomposer {
  public decomposeRequest(goal: string): PlannedTask[] {
    const tasks: PlannedTask[] = [];
    const lowerGoal = goal.toLowerCase();
    console.log(`[TaskDecomposer] Decomposing request with goal: ${lowerGoal}`);

    // Default structure: Database, API, UI, Testing, Security
    tasks.push({
      id: 'TASK-0001',
      title: 'Database Schema Design',
      description: 'Define relational/document tables, indexes and fields required for the feature.',
      category: 'database'
    });

    tasks.push({
      id: 'TASK-0002',
      title: 'Backend API Service Implementation',
      description: 'Create request/response handlers, controllers, endpoints, and validation logic.',
      category: 'api'
    });

    tasks.push({
      id: 'TASK-0003',
      title: 'UI Component Interface Development',
      description: 'Create premium React components, styling layouts, interactive drawers, and controls.',
      category: 'ui'
    });

    tasks.push({
      id: 'TASK-0004',
      title: 'Security & Access Middleware Integration',
      description: 'Define permissions middleware, authentication checks, and input sanitizer protocols.',
      category: 'security'
    });

    tasks.push({
      id: 'TASK-0005',
      title: 'Automated Integration Testing',
      description: 'Implement unit testing scripts, API validation mocks, and compilation coverage runs.',
      category: 'testing'
    });

    return tasks;
  }
}

export const taskDecomposer = new TaskDecomposer();
export default taskDecomposer;
