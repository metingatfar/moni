export interface StaticAnalysisReview {
  agentName: string;
  confidence: number;
  codeSmellsCount: number;
  warnings: string[];
  findings: string[];
}

export class StaticAnalysisAgent {
  public runStaticAnalysis(blueprint: any): StaticAnalysisReview {
    const findings: string[] = [];
    const warnings: string[] = [];

    const complexity = blueprint?.complexityScore || 50;
    findings.push('Analyzing linter configuration rules.');

    if (complexity > 75) {
      warnings.push('High Cyclomatic Complexity in blueprint schema endpoints.');
    }

    return {
      agentName: 'StaticAnalysisAgent',
      confidence: 0.91,
      codeSmellsCount: complexity > 60 ? 3 : 0,
      warnings,
      findings
    };
  }
}
