export class FeatureDependencyPlanner {
  public planDependencies(userInput: string): Record<string, string[]> {
    const dependencies: Record<string, string[]> = {};
    const lower = userInput.toLowerCase();

    dependencies['Database Migration'] = [];
    dependencies['Authentication Service'] = ['Database Migration'];
    dependencies['User Dashboard UI'] = ['Authentication Service'];
    dependencies['Profile API Routing'] = ['Authentication Service'];

    if (lower.includes('fitness') || lower.includes('health')) {
      dependencies['Workout Tracker Service'] = ['Database Migration'];
      dependencies['Workout UI Views'] = ['Workout Tracker Service', 'User Dashboard UI'];
      dependencies['AI Meal Recommendations'] = ['Profile API Routing'];
    } else if (lower.includes('erp') || lower.includes('enterprise')) {
      dependencies['Inventory Manager Service'] = ['Database Migration'];
      dependencies['Inventory UI Cards'] = ['Inventory Manager Service', 'User Dashboard UI'];
    }

    dependencies['Analytics Reports Generator'] = ['User Dashboard UI'];
    dependencies['Docker Package Build'] = ['Database Migration', 'Authentication Service'];

    return dependencies;
  }
}
