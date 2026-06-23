export type ExecutivePolicy = 'Standard' | 'HealthPriority' | 'PlanningPriority' | 'InternetSuggested';

export class ExecutivePolicyEngine {
  public determinePolicy(input: string): ExecutivePolicy {
    const lower = input.toLowerCase();
    
    if (lower.includes('yorgun') || lower.includes('halsiz') || lower.includes('sağlık') || lower.includes('moral')) {
      return 'HealthPriority';
    }
    
    if (lower.includes('proje') || lower.includes('kod') || lower.includes('build') || lower.includes('sprint') || lower.includes('geliştirme') || lower.includes('plan')) {
      return 'PlanningPriority';
    }
    
    if (lower.includes('hava') || lower.includes('dolar') || lower.includes('borsa') || lower.includes('güncel')) {
      return 'InternetSuggested';
    }
    
    return 'Standard';
  }
}
