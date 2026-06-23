import type { ExecutivePolicy } from './ExecutivePolicyEngine';

export class ExecutivePriorityManager {
  private basePriorityStack = ['Health', 'Critical', 'Reasoning', 'Planning', 'Tool', 'LLM'];

  public getPriorities(policy: ExecutivePolicy): string[] {
    const stack = [...this.basePriorityStack];
    
    if (policy === 'HealthPriority') {
      // Bring health to the front
      const healthIdx = stack.indexOf('Health');
      if (healthIdx > -1) {
        stack.splice(healthIdx, 1);
      }
      return ['Health', ...stack];
    }
    
    if (policy === 'PlanningPriority') {
      // Bring planning forward
      const planIdx = stack.indexOf('Planning');
      if (planIdx > -1) {
        stack.splice(planIdx, 1);
      }
      return ['Planning', 'Critical', 'Reasoning', ...stack];
    }
    
    return stack;
  }
}
