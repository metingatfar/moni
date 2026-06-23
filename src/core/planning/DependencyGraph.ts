export class DependencyGraph {
  private adjList: Map<string, string[]> = new Map();

  public addNode(nodeId: string): void {
    if (!this.adjList.has(nodeId)) {
      this.adjList.set(nodeId, []);
    }
  }

  public addDependency(fromNode: string, toNode: string): void {
    this.addNode(fromNode);
    this.addNode(toNode);
    const deps = this.adjList.get(fromNode);
    if (deps && !deps.includes(toNode)) {
      deps.push(toNode);
    }
    
    // Check for circular dependency immediately to prevent lock
    this.detectCircularDependency();
  }

  public getDependencies(nodeId: string): string[] {
    return this.adjList.get(nodeId) || [];
  }

  public detectCircularDependency(): void {
    const visited: Record<string, boolean> = {};
    const recStack: Record<string, boolean> = {};

    const dfs = (node: string): boolean => {
      visited[node] = true;
      recStack[node] = true;

      const neighbors = this.adjList.get(node) || [];
      for (const next of neighbors) {
        if (!visited[next]) {
          if (dfs(next)) return true;
        } else if (recStack[next]) {
          return true; // Circular dependency detected!
        }
      }

      recStack[node] = false;
      return false;
    };

    for (const node of this.adjList.keys()) {
      if (!visited[node]) {
        if (dfs(node)) {
          throw new Error(`Circular dependency detected in graph starting from node: ${node}`);
        }
      }
    }
  }

  public getTopologicalOrder(): string[] {
    this.detectCircularDependency();

    const order: string[] = [];
    const visited: Record<string, boolean> = {};

    const visit = (node: string) => {
      if (visited[node]) return;
      visited[node] = true;

      const neighbors = this.adjList.get(node) || [];
      for (const next of neighbors) {
        visit(next);
      }
      order.unshift(node); // Prepends to keep correct ordering
    };

    for (const node of this.adjList.keys()) {
      visit(node);
    }

    return order.reverse(); // Reverse to execute dependencies first
  }

  public getSize(): number {
    return this.adjList.size;
  }

  public clear(): void {
    this.adjList.clear();
  }
}
export const dependencyGraph = new DependencyGraph();
export default dependencyGraph;
