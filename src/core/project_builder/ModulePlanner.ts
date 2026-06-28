import type { ModulePlan } from './ProjectBlueprint';

export class ModulePlanner {
  public planModules(userInput: string): ModulePlan[] {
    const modules: ModulePlan[] = [];
    const lower = userInput.toLowerCase();

    // Default modules
    modules.push({
      name: 'Authentication',
      description: 'User registration, login, and token session management.',
      files: ['src/core/auth/AuthService.ts', 'src/presentation/screens/LoginScreen.tsx'],
      dependencies: []
    });

    modules.push({
      name: 'Dashboard',
      description: 'Main dashboard containing visual charts and navigation panels.',
      files: ['src/presentation/screens/DashboardScreen.tsx', 'src/presentation/components/MetricCard.tsx'],
      dependencies: ['Authentication']
    });

    if (lower.includes('fitness') || lower.includes('health')) {
      modules.push({
        name: 'Workouts',
        description: 'Track exercises, routines, and training history logs.',
        files: ['src/core/workouts/WorkoutTracker.ts', 'src/presentation/screens/WorkoutScreen.tsx'],
        dependencies: ['Authentication', 'Dashboard']
      });
      modules.push({
        name: 'Nutrition',
        description: 'Log calorie intakes, meals plan, and weight targets.',
        files: ['src/core/nutrition/CalorieCalculator.ts', 'src/presentation/screens/MealScreen.tsx'],
        dependencies: ['Authentication', 'Dashboard']
      });
    } else if (lower.includes('erp') || lower.includes('admin') || lower.includes('enterprise')) {
      modules.push({
        name: 'Inventory',
        description: 'Stock level tracking, procurement orders, and vendors registry.',
        files: ['src/core/inventory/StockManager.ts', 'src/presentation/screens/InventoryScreen.tsx'],
        dependencies: ['Authentication', 'Dashboard']
      });
      modules.push({
        name: 'Finance',
        description: 'Billing invoice calculations, transaction ledgers, and reporting.',
        files: ['src/core/finance/Ledger.ts', 'src/presentation/screens/FinanceScreen.tsx'],
        dependencies: ['Authentication', 'Dashboard']
      });
    } else {
      // General app modules
      modules.push({
        name: 'Core Engine',
        description: 'Core business processing engines and adapters logic.',
        files: ['src/core/engine/CoreProcessor.ts', 'src/core/engine/DataAdapter.ts'],
        dependencies: ['Authentication']
      });
    }

    // Always include a reports module
    modules.push({
      name: 'Analytics & Reports',
      description: 'Compile data analytics metrics and render export logs.',
      files: ['src/core/analytics/ReportGenerator.ts', 'src/presentation/screens/ReportsScreen.tsx'],
      dependencies: ['Dashboard']
    });

    return modules;
  }
}
