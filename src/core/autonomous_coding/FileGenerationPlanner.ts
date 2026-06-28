export interface FileGenerationPlan {
  filesToCreate: string[];
  filesToModify: string[];
  dependencies: string[];
  testsToGenerate: string[];
}

export class FileGenerationPlanner {
  public planGeneration(goal: string, _strategy: string): FileGenerationPlan {
    const filesToCreate: string[] = [];
    const filesToModify: string[] = [];
    const dependencies: string[] = [];
    const testsToGenerate: string[] = [];

    // Simple planning based on strategy/goal
    if (goal.toLowerCase().includes('auth')) {
      filesToCreate.push('src/core/auth/AuthService.ts');
      filesToModify.push('src/core/container/Bootstrap.ts');
      dependencies.push('jwt-decode');
      testsToGenerate.push('scratch/test_auth_service.ts');
    } else {
      filesToCreate.push('src/core/feature/CustomFeature.ts');
      filesToModify.push('src/core/container/Bootstrap.ts');
      testsToGenerate.push('scratch/test_custom_feature.ts');
    }

    return {
      filesToCreate,
      filesToModify,
      dependencies,
      testsToGenerate
    };
  }
}

export const fileGenerationPlanner = new FileGenerationPlanner();
export default fileGenerationPlanner;
