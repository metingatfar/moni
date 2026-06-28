import type { PatchDraft } from './AutonomousCodeGenerator';

export interface PerformanceReview {
  hasDeepLoops: boolean;
  hasLargeAllocations: boolean;
  isAsyncOptimized: boolean;
  recommendations: string[];
}

export class PerformanceReviewEngine {
  public reviewPerformance(draft: PatchDraft): PerformanceReview {
    const code = draft.patchContent || '';
    const recommendations: string[] = [];

    const hasDeepLoops = code.includes('for') && code.split('for').length > 3;
    const hasLargeAllocations = code.includes('new Array(10000');
    const isAsyncOptimized = code.includes('Promise.all') || !code.includes('await');

    if (hasDeepLoops) recommendations.push('Optimize: Nested loops detected. Consider caching values.');
    if (!isAsyncOptimized) recommendations.push('Optimize: Sequential await execution found. Consider Promise.all packaging.');

    return {
      hasDeepLoops,
      hasLargeAllocations,
      isAsyncOptimized,
      recommendations
    };
  }
}

export const performanceReviewEngine = new PerformanceReviewEngine();
export default performanceReviewEngine;
