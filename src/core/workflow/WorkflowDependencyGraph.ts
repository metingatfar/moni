// ===================================================================
// MONI Sprint 7.0 — WorkflowDependencyGraph.ts
// Models dependencies, topological sorting, and cycle detection.
// ===================================================================

import type { WorkflowStep } from './WorkflowPlanner';

export class WorkflowDependencyGraph {
  buildGraph(steps: WorkflowStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    for (const step of steps) {
      graph.set(step.stepId, step.dependencies);
    }
    return graph;
  }

  hasCycles(steps: WorkflowStep[]): boolean {
    const adjList = this.buildGraph(steps);
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string): boolean => {
      if (recStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recStack.add(node);

      const neighbors = adjList.get(node) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      recStack.delete(node);
      return false;
    };

    for (const node of adjList.keys()) {
      if (dfs(node)) return true;
    }

    return false;
  }

  getExecutionOrder(steps: WorkflowStep[]): string[] {
    if (this.hasCycles(steps)) {
      throw new Error('Cyclic dependency detected. Cannot determine execution order.');
    }

    const adjList = this.buildGraph(steps);
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (node: string) => {
      if (visited.has(node)) return;
      visited.add(node);

      const neighbors = adjList.get(node) || [];
      for (const neighbor of neighbors) {
        visit(neighbor);
      }
      order.push(node);
    };

    for (const node of adjList.keys()) {
      visit(node);
    }

    return order; // Topological order (dependencies first)
  }
}
