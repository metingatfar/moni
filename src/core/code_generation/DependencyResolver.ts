export class DependencyResolver {
  public resolveExecutionOrder(files: string[], depsMap: Record<string, string[]>): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (file: string) => {
      if (visited.has(file)) return;
      visited.add(file);
      const deps = depsMap[file] || [];
      for (const d of deps) {
        visit(d);
      }
      order.push(file);
    };

    for (const f of files) {
      visit(f);
    }

    return order;
  }
}
