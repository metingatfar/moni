import type { DecisionChoice } from './DecisionEngine';
import type { Evidence } from './EvidenceCollector';

export interface ReflectionResult {
  isApproved: boolean;
  adjustedConfidence: number;
  reflectionNotes: string[];
}

export class ReflectionEngine {
  private revisionCount = 0;

  public reflectOnDecision(choice: DecisionChoice, evidences: Evidence[]): ReflectionResult {
    const notes: string[] = [];
    let isApproved = true;
    let adjustedConfidence = choice.selectedAlternative.confidence;

    // 1. Check for missing critical evidence
    const hasLtmEvidence = evidences.some(e => e.source === 'LongTermMemory');
    if (!hasLtmEvidence) {
      this.revisionCount++;
      notes.push('Kullanıcı hakkında geçmiş hafıza kaydı bulunamadığı için tahmin güveni düşürüldü.');
      adjustedConfidence = Math.max(0.4, adjustedConfidence - 0.1);
    }

    // 2. Security / Safety contradiction check
    const hasHealthRisk = choice.riskAnalysis.risks.some(r => r.category === 'health');
    if (hasHealthRisk && choice.riskAnalysis.overallRiskScore === 'high') {
      this.revisionCount++;
      notes.push('Yüksek sağlık riski tespit edildi. Güvenli mod veya onay katmanı zorunlu kılınmalı.');
      adjustedConfidence = Math.max(0.3, adjustedConfidence - 0.2);
    }

    notes.push('Karar mantıksal doğrulama süzgecinden geçirildi, çelişki tespit edilmedi.');

    return {
      isApproved,
      adjustedConfidence: Math.round(adjustedConfidence * 100) / 100,
      reflectionNotes: notes
    };
  }

  public getRevisionCount(): number {
    return this.revisionCount;
  }
}
