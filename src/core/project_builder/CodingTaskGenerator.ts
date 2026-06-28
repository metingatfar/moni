import type { DeveloperCodingTask } from './ExecutionPackage';

export class CodingTaskGenerator {
  public generateTasks(userInput: string): DeveloperCodingTask[] {
    const tasks: DeveloperCodingTask[] = [];
    const lower = userInput.toLowerCase();

    tasks.push({
      id: 'task-db-migrations',
      name: 'Create Relational Tables SQL Migrations',
      priority: 'high',
      dependencies: [],
      estimatedHours: 8,
      responsibleAgent: 'Software Architect',
      targetModule: 'Database',
      approvalRequired: true
    });

    tasks.push({
      id: 'task-auth-service',
      name: 'Implement Password hashing and JWT token issuance',
      priority: 'critical',
      dependencies: ['task-db-migrations'],
      estimatedHours: 12,
      responsibleAgent: 'Developer',
      targetModule: 'Authentication',
      approvalRequired: true
    });

    tasks.push({
      id: 'task-dashboard-ui',
      name: 'Design layout containing workspace components cards',
      priority: 'medium',
      dependencies: ['task-auth-service'],
      estimatedHours: 10,
      responsibleAgent: 'UI Designer',
      targetModule: 'Dashboard',
      approvalRequired: false
    });

    if (lower.includes('fitness') || lower.includes('health')) {
      tasks.push({
        id: 'task-workout-logger',
        name: 'Implement exercise list tracker endpoints',
        priority: 'high',
        dependencies: ['task-db-migrations'],
        estimatedHours: 14,
        responsibleAgent: 'Developer',
        targetModule: 'Workouts',
        approvalRequired: true
      });
    } else if (lower.includes('erp') || lower.includes('enterprise')) {
      tasks.push({
        id: 'task-inventory-stock',
        name: 'Implement stock item listing logic',
        priority: 'high',
        dependencies: ['task-db-migrations'],
        estimatedHours: 16,
        responsibleAgent: 'Developer',
        targetModule: 'Inventory',
        approvalRequired: true
      });
    }

    tasks.push({
      id: 'task-unit-tests',
      name: 'Write automated testing scenarios',
      priority: 'medium',
      dependencies: ['task-auth-service'],
      estimatedHours: 8,
      responsibleAgent: 'Tester',
      targetModule: 'Analytics & Reports',
      approvalRequired: false
    });

    return tasks;
  }
}
