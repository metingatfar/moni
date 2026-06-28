export interface FixPlan {
  planId: string;
  strategy: string;
  requiredChanges: string[];
  estimatedRisk: 'Low' | 'Medium' | 'High';
  estimatedDurationMinutes: number;
}

export class FixPlanner {
  public planFix(category: string, rootCauseMessage: string): FixPlan {
    const requiredChanges: string[] = [];
    let strategy = '';
    let risk: FixPlan['estimatedRisk'] = 'Low';
    let duration = 5;

    if (category === 'syntax') {
      strategy = 'Re-align parentheses, commas, or semicolons in syntax tree.';
      requiredChanges.push('Update syntax token positions');
      risk = 'Low';
      duration = 2;
    } else if (category === 'dependency') {
      strategy = 'Update package version reference in workspace settings or trigger local installer.';
      requiredChanges.push('Resolve circular dependencies in package imports');
      requiredChanges.push('Run dependency resolution update');
      risk = 'Medium';
      duration = 15;
    } else if (category === 'security') {
      strategy = 'Wrap endpoint handler with authorization check middleware or JWT verification.';
      requiredChanges.push('Add token audit middleware config');
      risk = 'High';
      duration = 25;
    } else if (category === 'performance') {
      strategy = 'Introduce lazy loading configurations, caching policies or query index filters.';
      requiredChanges.push('Configure Cache-Control headers');
      risk = 'Medium';
      duration = 10;
    } else {
      strategy = `Apply generic software diagnostics patch targeting: ${rootCauseMessage}`;
      requiredChanges.push('Check function signature integrity constraints');
      risk = 'Low';
      duration = 5;
    }

    return {
      planId: `fix-plan-${Date.now()}`,
      strategy,
      requiredChanges,
      estimatedRisk: risk,
      estimatedDurationMinutes: duration
    };
  }
}
