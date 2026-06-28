import type { PatchQualityMetrics } from './PatchQualityAnalyzer';
import type { EngineeringStandardsReport } from './EngineeringStandardsEngine';

export interface Scorecard {
  qualityScore: number;
  securityScore: number;
  maintainabilityScore: number;
  standardsScore: number;
  testabilityScore: number;
  overallScore: number;
}

export class EngineeringScoreEngine {
  public calculateScorecard(
    quality: PatchQualityMetrics,
    standards: EngineeringStandardsReport,
    hasSecurityWarning: boolean
  ): Scorecard {
    const qualityScore = quality.readabilityScore;
    const securityScore = hasSecurityWarning ? 50 : 98;
    const maintainabilityScore = quality.maintainabilityScore;
    
    // Standards score calculated from standards passes
    const passes = [
      standards.solidPass,
      standards.dryPass,
      standards.kissPass,
      standards.yagniPass,
      standards.cleanArchitecturePass,
      standards.diPass,
      standards.layerSeparationPass
    ];
    const passCount = passes.filter(Boolean).length;
    const standardsScore = Math.round((passCount / passes.length) * 100);
    
    const testabilityScore = 95; // Default score

    const overallScore = Math.round(
      (qualityScore * 0.25) +
      (securityScore * 0.25) +
      (maintainabilityScore * 0.20) +
      (standardsScore * 0.15) +
      (testabilityScore * 0.15)
    );

    return {
      qualityScore,
      securityScore,
      maintainabilityScore,
      standardsScore,
      testabilityScore,
      overallScore
    };
  }
}

export const engineeringScoreEngine = new EngineeringScoreEngine();
export default engineeringScoreEngine;
