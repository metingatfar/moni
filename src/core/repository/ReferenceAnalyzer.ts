export interface SymbolReference {
  symbolName: string;
  referencedInFiles: string[];
}

export class ReferenceAnalyzer {
  private references: Record<string, string[]> = {
    'ExecutiveBrain': [
      'src/core/container/Bootstrap.ts',
      'src/core/brain/ExecutiveBrain.ts',
      'src/core/executive/AutonomousExecutiveEngine.ts'
    ],
    'ReasoningEngine': [
      'src/core/container/Bootstrap.ts',
      'src/core/brain/ExecutiveBrain.ts'
    ],
    'PlanningEngine': [
      'src/core/container/Bootstrap.ts',
      'src/core/brain/ExecutiveBrain.ts'
    ]
  };

  public getReferences(symbolName: string): string[] {
    return this.references[symbolName] || [];
  }

  public getReferenceCount(symbolName: string): number {
    return this.getReferences(symbolName).length;
  }

  public analyzeReferences(): Record<string, string[]> {
    return { ...this.references };
  }
}

export const referenceAnalyzer = new ReferenceAnalyzer();
export default referenceAnalyzer;
