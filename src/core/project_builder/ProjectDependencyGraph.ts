import type { DependencyNode } from './ExecutionPackage';
import type { ProjectBlueprint } from './ProjectBlueprint';

export class ProjectDependencyGraph {
  public buildGraph(blueprint: ProjectBlueprint): DependencyNode[] {
    const nodes: DependencyNode[] = [];

    // Modules dependencies
    for (const m of blueprint.modules) {
      nodes.push({
        id: `module-${m.name}`,
        type: 'module',
        dependencies: m.dependencies.map(d => `module-${d}`)
      });
    }

    // API dependencies
    for (const api of blueprint.apis) {
      nodes.push({
        id: `api-${api.path}`,
        type: 'api',
        dependencies: ['module-Authentication']
      });
    }

    // Database tables dependencies
    for (const table of blueprint.database.tables) {
      const dbDeps: string[] = [];
      for (const rel of table.relations) {
        if (rel.includes('users') && table.name !== 'users') {
          dbDeps.push('database-users');
        }
      }
      nodes.push({
        id: `database-${table.name}`,
        type: 'database',
        dependencies: dbDeps
      });
    }

    // AI Tasks dependencies
    for (const task of blueprint.aiTasks) {
      nodes.push({
        id: `aiTask-${task.name}`,
        type: 'aiTask',
        dependencies: ['module-Core Engine']
      });
    }

    // Test suites dependencies
    for (const suite of blueprint.testing.testSuites) {
      const filename = suite.split('/').pop() || '';
      nodes.push({
        id: `testSuite-${filename}`,
        type: 'testSuite',
        dependencies: ['module-Authentication']
      });
    }

    return nodes;
  }
}
