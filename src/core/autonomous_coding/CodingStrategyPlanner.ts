import type { CodingIntent } from './CodingIntentAnalyzer';

export type CodingStrategy = 'interface-first' | 'test-first' | 'minimal-change' | 'layer-first' | 'incremental' | 'full-module';

export class CodingStrategyPlanner {
  public planStrategy(intent: CodingIntent, constraints: string[]): CodingStrategy {
    const hasTestConstraint = constraints.some(c => c.toLowerCase().includes('test'));

    if (hasTestConstraint) {
      return 'test-first';
    }

    switch (intent) {
      case 'database':
      case 'api':
        return 'interface-first';
      case 'refactor':
      case 'optimization':
        return 'minimal-change';
      case 'ui':
        return 'layer-first';
      default:
        return 'full-module';
    }
  }
}

export const codingStrategyPlanner = new CodingStrategyPlanner();
export default codingStrategyPlanner;
