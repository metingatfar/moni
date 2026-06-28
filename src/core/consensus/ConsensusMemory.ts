import type { ConsensusDecision } from './ConsensusDecisionEngine';
import type { ReasoningAudit } from './EngineeringReasoner';

export interface ConsensusMemoryEntry {
  timestamp: string;
  selectedProvider: string;
  selectedStrategy: string;
  confidence: number;
  rejectedAlternatives: string[];
  reasoningScore: number;
}

export class ConsensusMemory {
  private history: ConsensusMemoryEntry[] = [];
  private providerWins: Record<string, number> = {};
  private providerAttempts: Record<string, number> = {};

  public logDecision(decision: ConsensusDecision, audit: ReasoningAudit): void {
    const entry: ConsensusMemoryEntry = {
      timestamp: new Date().toISOString(),
      selectedProvider: decision.selectedProvider,
      selectedStrategy: decision.selectedStrategy,
      confidence: decision.confidence,
      rejectedAlternatives: decision.rejectedAlternatives,
      reasoningScore: audit.reasoningScore
    };
    
    this.history.push(entry);

    // Track attempts
    const allProviders = [decision.selectedProvider, ...decision.rejectedAlternatives];
    for (const p of allProviders) {
      this.providerAttempts[p] = (this.providerAttempts[p] || 0) + 1;
    }
    
    // Track win
    this.providerWins[decision.selectedProvider] = (this.providerWins[decision.selectedProvider] || 0) + 1;
  }

  public getHistory(): ConsensusMemoryEntry[] {
    return this.history;
  }

  public getProviderWinRates(): Record<string, number> {
    const winRates: Record<string, number> = {};
    for (const p of Object.keys(this.providerAttempts)) {
      const attempts = this.providerAttempts[p];
      const wins = this.providerWins[p] || 0;
      winRates[p] = Math.round((wins / attempts) * 100);
    }
    return winRates;
  }
}

export const consensusMemory = new ConsensusMemory();
export default consensusMemory;
