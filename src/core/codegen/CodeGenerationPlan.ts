export interface CodeGenerationPlanData {
  planId: string;
  requestId: string;
  targetFiles: string[];
  generationStrategy: string;
  estimatedChanges: number;
  dependencies: string[];
  risks: string[];
  rollbackPlan: string[];
  confidence: number;
  requiresApproval: boolean;
}

export class CodeGenerationPlan {
  public createPlan(requestId: string, targetFiles: string[], strategy: string): CodeGenerationPlanData {
    return {
      planId: 'plan-' + Date.now(),
      requestId,
      targetFiles,
      generationStrategy: strategy,
      estimatedChanges: targetFiles.length,
      dependencies: ['ServiceContainer', 'Bootstrap'],
      risks: ['Dependency regression', 'Bootstrap mismatch'],
      rollbackPlan: ['git checkout file'],
      confidence: 96,
      requiresApproval: true
    };
  }
}

export const codeGenerationPlan = new CodeGenerationPlan();
export default codeGenerationPlan;
