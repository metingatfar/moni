export class LearningScoreEngine {
  private scores: Record<string, number> = {
    ReasoningEngine: 95,
    PlanningEngine: 92,
    ToolIntelligenceEngine: 88,
    VisionIntelligenceEngine: 90,
    KnowledgeEngine: 94,
    MemoryEngine: 96
  };

  public getScores(): Record<string, number> {
    return this.scores;
  }

  public updateScores(feedback: 'like' | 'dislike', strategy: string): Record<string, number> {
    const penalty = feedback === 'dislike' ? 4 : 1;
    const boost = feedback === 'like' ? 2 : 0;

    // Adjust specific module scores based on chosen strategy
    if (strategy.includes('Plan') || strategy.includes('roadmap')) {
      this.adjustScore('PlanningEngine', boost - penalty);
    } else if (strategy.includes('Tool') || strategy.includes('execute')) {
      this.adjustScore('ToolIntelligenceEngine', boost - penalty);
    } else if (strategy.includes('Vision') || strategy.includes('görsel')) {
      this.adjustScore('VisionIntelligenceEngine', boost - penalty);
    } else {
      this.adjustScore('ReasoningEngine', boost - penalty);
    }

    return this.scores;
  }

  private adjustScore(moduleName: string, delta: number): void {
    if (this.scores[moduleName] !== undefined) {
      this.scores[moduleName] = Math.max(0, Math.min(100, this.scores[moduleName] + delta));
    }
  }

  public calculateOverallScore(): number {
    const vals = Object.values(this.scores);
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round(sum / vals.length);
  }
}
