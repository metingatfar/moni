import type { PatchDraft } from './AutonomousCodeGenerator';

export interface PatchQualityMetrics {
  safetyScore: number; // 0-100
  readabilityScore: number; // 0-100
  maintainabilityScore: number; // 0-100
  architectureComplianceScore: number; // 0-100
}

export class PatchQualityAnalyzer {
  public analyzePatchQuality(draft: PatchDraft): PatchQualityMetrics {
    const code = draft.patchContent || '';

    const safetyScore = code.includes('try') && !code.includes('eval') ? 95 : 70;
    const readabilityScore = code.includes('//') || code.includes('/**') ? 92 : 80;
    const maintainabilityScore = code.includes('class') || code.includes('interface') ? 90 : 80;
    const architectureComplianceScore = !code.includes('server') || draft.targetFile.includes('server') ? 95 : 60;

    return {
      safetyScore,
      readabilityScore,
      maintainabilityScore,
      architectureComplianceScore
    };
  }
}

export const patchQualityAnalyzer = new PatchQualityAnalyzer();
export default patchQualityAnalyzer;
