import type { DecisionChoice } from './DecisionEngine';
import type { ReflectionResult } from './ReflectionEngine';

export interface ExplanationResult {
  reasonSelected: string;
  confidencePercent: number;
  rejectedAlternatives: string[];
  potentialRisks: string[];
  expectedOutcome: string;
  humanReadableSummary: string;
}

export class ExplainabilityEngine {
  public generateExplanation(choice: DecisionChoice, reflection: ReflectionResult, rejectedPlans: string[]): ExplanationResult {
    const selectedPlan = choice.selectedAlternative.planName;
    const finalConf = reflection.adjustedConfidence * 100;

    const potentialRisks = choice.riskAnalysis.risks.map(r => 
      `${r.category.toUpperCase()}: ${r.mitigation}`
    );

    const humanReadableSummary = `Seçilen Çözüm: ${selectedPlan} (Güven: %${finalConf.toFixed(0)}). Olası riskler önlenerek en optimum yol haritası planlanmıştır.`;

    return {
      reasonSelected: `Kullanıcı girdisine dair en yüksek başarı olasılığına ve en düşük risk skoruna sahip alternatif seçildi: ${selectedPlan}`,
      confidencePercent: finalConf,
      rejectedAlternatives: rejectedPlans,
      potentialRisks: potentialRisks.length > 0 ? potentialRisks : ['Belirgin bir risk bulunmamaktadır.'],
      expectedOutcome: 'Talebin planlama motoruna aktarılarak aşamalı iş adımlarına dönüştürülmesi.',
      humanReadableSummary
    };
  }
}
export const explainabilityEngine = new ExplainabilityEngine();
export default explainabilityEngine;
