import type { PatchDraft } from './AutonomousCodeGenerator';

export interface StaticAnalysis {
  smellCount: number;
  unusedVariablesCount: number;
  cyclomaticComplexity: number;
  layerViolationDetected: boolean;
  issues: string[];
}

export class StaticAnalysisEngine {
  public analyzeCode(draft: PatchDraft): StaticAnalysis {
    const code = draft.patchContent || '';
    const issues: string[] = [];

    const cyclomaticComplexity = code.includes('catch') || code.includes('if') ? 4 : 2;
    const smellCount = code.includes('any') ? 1 : 0;
    const unusedVariablesCount = 0;
    
    // Check layer violation: frontend importing backend directly, etc.
    const layerViolationDetected = code.includes('import') && code.includes('server') && draft.targetFile.includes('presentation');

    if (smellCount > 0) issues.push('Smell: Explicit "any" type found.');
    if (layerViolationDetected) issues.push('Violation: Direct presentation-server import detected.');

    return {
      smellCount,
      unusedVariablesCount,
      cyclomaticComplexity,
      layerViolationDetected,
      issues
    };
  }
}

export const staticAnalysisEngine = new StaticAnalysisEngine();
export default staticAnalysisEngine;
