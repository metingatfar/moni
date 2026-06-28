import { consensusMemory } from './ConsensusMemory';

export interface ConsensusMetricsSummary {
  consensusExecutions: number;
  averageAgreement: number; // 0-100
  disagreementRate: number; // 0-100
  conflictCount: number;
  averageConfidence: number; // 0-100
  averageReasoningScore: number; // 0-100
  providerWinRates: Record<string, number>;
}

export class ConsensusMetrics {
  private totalExecutions = 0;
  private totalAgreement = 0;
  private totalDisagreement = 0;
  private conflictCount = 0;
  private totalConfidence = 0;
  private totalReasoningScore = 0;

  public recordExecution(
    agreement: number,
    disagreement: number,
    hasConflict: boolean,
    confidence: number,
    reasoningScore: number
  ): void {
    this.totalExecutions++;
    this.totalAgreement += agreement;
    this.totalDisagreement += disagreement;
    if (hasConflict) this.conflictCount++;
    this.totalConfidence += confidence;
    this.totalReasoningScore += reasoningScore;
  }

  public getSummary(): ConsensusMetricsSummary {
    const count = this.totalExecutions || 1;
    return {
      consensusExecutions: this.totalExecutions,
      averageAgreement: Math.round((this.totalAgreement / count) * 100),
      disagreementRate: Math.round((this.totalDisagreement / count) * 100),
      conflictCount: this.conflictCount,
      averageConfidence: Math.round(this.totalConfidence / count),
      averageReasoningScore: Math.round(this.totalReasoningScore / count),
      providerWinRates: consensusMemory.getProviderWinRates()
    };
  }
}

export const consensusMetrics = new ConsensusMetrics();
export default consensusMetrics;
