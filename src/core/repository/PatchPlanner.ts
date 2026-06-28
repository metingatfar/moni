export interface PlannedStep {
  file: string;
  action: 'create' | 'modify';
  dependsOn: string[];
}

export interface PatchPlan {
  steps: PlannedStep[];
  rollbackPoints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedMinutes: number;
}

export class PatchPlanner {
  public generatePlan(_requestText: string): PatchPlan {
    return {
      steps: [
        { file: 'src/core/container/Bootstrap.ts', action: 'modify', dependsOn: [] },
        { file: 'src/core/brain/ExecutiveBrain.ts', action: 'modify', dependsOn: [] },
        { file: 'src/presentation/MoniDashboard.tsx', action: 'modify', dependsOn: [] }
      ],
      rollbackPoints: ['git checkout src/core/container/Bootstrap.ts'],
      difficulty: 'Medium',
      estimatedMinutes: 45
    };
  }
}

export const patchPlanner = new PatchPlanner();
export default patchPlanner;
