import { EngineRegistry } from './EngineRegistry';
import type { WorkflowPlan } from './WorkflowPlanner';

export class DependencyResolverOS {
  public validatePlan(plan: WorkflowPlan, registry: EngineRegistry): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const stepEngineNames = new Set(plan.steps.map((s) => s.engineName));

    for (const step of plan.steps) {
      const meta = registry.get(step.engineName);
      if (!meta) {
        errors.push(`Engine ${step.engineName} is not registered in the system.`);
        continue;
      }

      for (const dep of meta.dependencies) {
        if (!stepEngineNames.has(dep)) {
          errors.push(`Missing dependency: ${step.engineName} requires ${dep} but it is not planned in workflow.`);
        }
      }
    }

    // Cycle detection check
    const hasCycle = this.detectCycles(plan, registry);
    if (hasCycle) {
      errors.push('Circular dependency cycle detected in execution plan.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private detectCycles(plan: WorkflowPlan, registry: EngineRegistry): boolean {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (node: string): boolean => {
      if (stack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      stack.add(node);

      const meta = registry.get(node);
      if (meta) {
        for (const dep of meta.dependencies) {
          if (dfs(dep)) return true;
        }
      }

      stack.delete(node);
      return false;
    };

    for (const step of plan.steps) {
      if (dfs(step.engineName)) return true;
    }

    return false;
  }
}

export const dependencyResolverOS = new DependencyResolverOS();
export default dependencyResolverOS;
