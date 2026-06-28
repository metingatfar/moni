export type GenerationStrategy = 'minimal_change' | 'additive_change' | 'interface_first' | 'test_first' | 'documentation_first' | 'refactor_later';

export class CodeStrategySelector {
  public selectStrategy(intent: string, riskLevel: string): GenerationStrategy {
    if (intent === 'Architecture' || riskLevel === 'High') {
      return 'interface_first';
    }
    if (intent === 'Testing') {
      return 'test_first';
    }
    if (intent === 'Documentation') {
      return 'documentation_first';
    }
    if (intent === 'Refactor') {
      return 'refactor_later';
    }
    return 'minimal_change';
  }
}

export const codeStrategySelector = new CodeStrategySelector();
export default codeStrategySelector;
