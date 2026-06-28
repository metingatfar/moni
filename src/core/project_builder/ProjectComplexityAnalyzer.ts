import type { ComplexityMetrics } from './ExecutionPackage';

export class ProjectComplexityAnalyzer {
  public analyzeComplexity(
    moduleCount: number,
    apiCount: number,
    tableCount: number,
    aiTasksCount: number
  ): ComplexityMetrics {
    const estimatedLinesOfCode = moduleCount * 450 + apiCount * 120 + tableCount * 80;
    const databaseSizeMb = tableCount * 15;

    const uiComplexity = apiCount > 8 ? 'high' : apiCount > 4 ? 'medium' : 'low';
    const aiComplexity = aiTasksCount > 2 ? 'high' : aiTasksCount > 0 ? 'medium' : 'low';

    // Compute overall score (0-100)
    let score = moduleCount * 8 + apiCount * 4 + tableCount * 5 + aiTasksCount * 12;
    if (score > 100) score = 95; // cap it gracefully below limit

    return {
      estimatedLinesOfCode,
      moduleCount,
      apiCount,
      databaseSizeMb,
      uiComplexity,
      aiComplexity,
      overallScore: Math.round(score)
    };
  }
}
