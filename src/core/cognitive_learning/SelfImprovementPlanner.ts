export interface ModuleImprovement {
  moduleName: string;
  score: number;
  suggestions: string[];
}

export class SelfImprovementPlanner {
  public generateSuggestions(moduleScores: Record<string, number>): ModuleImprovement[] {
    const improvements: ModuleImprovement[] = [];

    for (const [moduleName, score] of Object.entries(moduleScores)) {
      const suggestions: string[] = [];

      if (score < 90) {
        if (moduleName === 'ToolIntelligenceEngine') {
          suggestions.push('Araç tahmin parametrelerini optimize et.');
          suggestions.push('Çakışan araç kurallarını düzenle.');
        } else if (moduleName === 'ReasoningEngine') {
          suggestions.push('Kanıt toplama güven katsayısını artır.');
          suggestions.push('Düşünme alternatiflerini genişlet.');
        } else if (moduleName === 'PlanningEngine') {
          suggestions.push('Plan hata kurtarma alternatiflerini optimize et.');
        } else if (moduleName === 'KnowledgeEngine') {
          suggestions.push('Yinelenen verileri birleştir.');
        } else if (moduleName === 'VisionIntelligenceEngine') {
          suggestions.push('OCR doğruluk filtrelerini iyileştir.');
        }
      }

      if (suggestions.length > 0) {
        improvements.push({
          moduleName,
          score,
          suggestions
        });
      }
    }

    // Sort by score ascending (lowest score needs improvement first)
    return improvements.sort((a, b) => a.score - b.score);
  }
}
