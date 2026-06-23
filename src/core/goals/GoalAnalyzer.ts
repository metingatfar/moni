import type { Goal } from './Goal';

export interface GoalAnalysisResult {
  hasStagnation: boolean;
  stagnationDays: number;
  risks: string[];
  causes: string[];
  suggestions: string[];
}

export class GoalAnalyzer {
  public analyzeGoal(goal: Goal, _lifeSnapshot: any): GoalAnalysisResult {
    const lastUpdate = new Date(goal.updatedAt).getTime();
    const daysSinceUpdate = Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60 * 24));
    
    const hasStagnation = daysSinceUpdate >= 7 && goal.status === 'active';
    const risks: string[] = [];
    const causes: string[] = [];
    const suggestions: string[] = [];

    if (hasStagnation) {
      if (goal.category === 'health' || goal.category === 'fitness') {
        causes.push("Egzersiz rutininde aksama veya beslenme takibinin bırakılması.");
        risks.push("Hedeflenen süre içinde hedeflenen ağırlığa ulaşılamaması riski.");
        suggestions.push("Günlük yürüyüş süresini 10 dakika artırabilirsiniz.", "Su tüketimini kontrol altına almak iyi bir adım olabilir.");
      } else {
        causes.push("Hedefe yönelik görevlerin ve günlük planların ertelenmesi.");
        risks.push("Proje veya çalışma planının gecikmesi.");
        suggestions.push("Bugün küçük ve kolay bir alt görevi tamamlayarak başlayın.");
      }
    } else {
      // General feedback
      suggestions.push("Harika gidiyorsunuz, mevcut rutininizi sürdürmenizi öneririm.");
    }

    return {
      hasStagnation,
      stagnationDays: hasStagnation ? daysSinceUpdate : 0,
      risks,
      causes,
      suggestions
    };
  }
}
