import type { ToolCapability } from './ToolCapabilityRegistry';
import type { ToolIntent } from './ToolIntentAnalyzer';

export interface ScoredTool {
  toolName: string;
  score: number; // 0 to 1.0
  capability: ToolCapability;
}

export class ToolScorer {
  public scoreTools(
    intent: ToolIntent,
    capabilities: ToolCapability[],
    learningStats: Record<string, { successRate: number; usageCount: number }> = {}
  ): ScoredTool[] {
    const scored: ScoredTool[] = [];

    for (const cap of capabilities) {
      let score = 0;

      // 1. Intent Match
      if (cap.supportedIntents.includes(intent.intent)) {
        score += 0.5;
      }

      // 2. Confidence multiplier
      score += intent.confidence * 0.2;

      // 3. LearningStats / History influence
      const stats = learningStats[cap.name];
      if (stats) {
        // High successRate increases score, low reduces it
        score += (stats.successRate - 0.5) * 0.2;
      } else {
        // Neutral starting point
        score += 0.1;
      }

      // 4. Latency/Cost Optimization penalty (lower is better)
      const costPenalty = (cap.estimatedCost / 100) * 0.1;
      score -= costPenalty;

      // Clamp score between 0 and 1
      const finalScore = Math.min(1.0, Math.max(0.0, score));

      scored.push({
        toolName: cap.name,
        score: Math.round(finalScore * 100) / 100,
        capability: cap
      });
    }

    // Sort by descending score
    return scored.sort((a, b) => b.score - a.score);
  }
}
