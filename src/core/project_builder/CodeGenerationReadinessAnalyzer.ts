import type { QualityGate, TechnicalRisk } from './ExecutionPackage';

export class CodeGenerationReadinessAnalyzer {
  public calculateReadiness(gates: QualityGate[], risks: TechnicalRisk[]): number {
    const passedRequiredGates = gates.filter(g => g.requiredForGeneration && g.status === 'passed').length;
    const totalRequiredGates = gates.filter(g => g.requiredForGeneration).length;

    if (totalRequiredGates === 0) return 100;

    let score = (passedRequiredGates / totalRequiredGates) * 100;

    // Deduct points based on risk scores
    const highRiskDeductions = risks.filter(r => r.severity === 'high' || r.severity === 'critical').length * 8;
    score -= highRiskDeductions;

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return Math.round(score);
  }
}
