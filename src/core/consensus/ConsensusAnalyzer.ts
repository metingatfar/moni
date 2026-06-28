import type { UnifiedAIResponse } from '../llm/ResponseNormalizer';

export interface AnalysisResult {
  agreementLevel: number; // 0 to 1
  disagreementLevel: number; // 0 to 1
  averageConfidence: number; // 0 to 100
  reasoningOverlap: string[];
  similarities: Map<string, number>; // Pairwise similarity
}

export class ConsensusAnalyzer {
  public analyzeResponses(responses: Map<string, UnifiedAIResponse>): AnalysisResult {
    const list = Array.from(responses.entries());
    if (list.length === 0) {
      return {
        agreementLevel: 0,
        disagreementLevel: 0,
        averageConfidence: 0,
        reasoningOverlap: [],
        similarities: new Map()
      };
    }

    if (list.length === 1) {
      return {
        agreementLevel: 1.0,
        disagreementLevel: 0,
        averageConfidence: 85,
        reasoningOverlap: ['Single provider response analysed.'],
        similarities: new Map()
      };
    }

    let totalSimilarity = 0;
    let comparisons = 0;
    const similarities = new Map<string, number>();

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [nameA, respA] = list[i];
        const [nameB, respB] = list[j];
        
        const sim = this.calculateSimilarity(respA.codeSuggestion, respB.codeSuggestion);
        similarities.set(`${nameA}-${nameB}`, sim);
        totalSimilarity += sim;
        comparisons++;
      }
    }

    const averageSimilarity = comparisons > 0 ? totalSimilarity / comparisons : 1.0;
    const agreementLevel = averageSimilarity;
    const disagreementLevel = 1.0 - agreementLevel;

    // Hardcode some mock overlap words or extract common words from explanations
    const reasoningOverlap = ['Refactoring patterns', 'Scalability considerations', 'Type definitions'];

    return {
      agreementLevel,
      disagreementLevel,
      averageConfidence: 88, // Mock average confidence
      reasoningOverlap,
      similarities
    };
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1.0;

    const set1 = new Set(str1.split(/\s+/));
    const set2 = new Set(str2.split(/\s+/));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }
}

export const consensusAnalyzer = new ConsensusAnalyzer();
export default consensusAnalyzer;
