export interface RegressionPlan {
  impactedModules: string[];
  retestRequired: boolean;
  recommendedTests: string[];
}

export class RegressionTestPlanner {
  public planRegression(targetFiles: string[]): RegressionPlan {
    const impactedModules: string[] = [];
    const recommendedTests: string[] = [];

    for (const file of targetFiles) {
      if (file.includes('auth')) {
        impactedModules.push('Authentication');
        recommendedTests.push('scratch/tests/auth/login.test.ts');
      }
      if (file.includes('database') || file.includes('db')) {
        impactedModules.push('DatabaseService');
        recommendedTests.push('scratch/tests/db/connection.test.ts');
      }
    }

    // Default fallbacks
    if (impactedModules.length === 0) {
      impactedModules.push('CoreEngine');
      recommendedTests.push('scratch/tests/core/bootstrap.test.ts');
    }

    return {
      impactedModules,
      retestRequired: true,
      recommendedTests
    };
  }
}

export const regressionTestPlanner = new RegressionTestPlanner();
export default regressionTestPlanner;
