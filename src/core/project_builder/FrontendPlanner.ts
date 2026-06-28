export class FrontendPlanner {
  public planFrontend(userInput: string, framework: string): { views: string[]; themeMode: string; styleMode: string } {
    const lower = userInput.toLowerCase();
    let views = ['Home', 'Login', 'Dashboard', 'Settings'];
    if (framework) {
      views = views.map(v => `${v} (${framework})`);
    }

    if (lower.includes('fitness') || lower.includes('health')) {
      views = [...views, 'WorkoutSession', 'MealLogger', 'AnalyticsGraphs', 'ProfileProgress'];
    } else if (lower.includes('erp') || lower.includes('admin') || lower.includes('enterprise')) {
      views = [...views, 'InventoryListing', 'PurchaseInvoice', 'TransactionLedger', 'VendorsGrid'];
    } else if (lower.includes('ai') || lower.includes('chat')) {
      views = [...views, 'AIChatRoom', 'ModelSelectionPanel', 'PromptHistory', 'TokenUsageDashboard'];
    }

    let styleMode = 'flat';
    if (lower.includes('glass') || lower.includes('glassmorphism')) {
      styleMode = 'glassmorphism';
    } else if (lower.includes('neo') || lower.includes('brutalism')) {
      styleMode = 'neo-brutalism';
    } else if (lower.includes('minimal')) {
      styleMode = 'minimalist';
    }

    const themeMode = lower.includes('light') ? 'light' : 'dark';

    return {
      views,
      themeMode,
      styleMode
    };
  }
}
