import type { FailureEvent } from './FailureEvent';
import { healingLoopEngine } from './HealingLoopEngine';
import type { HealingLoopResult } from './HealingLoopEngine';

export interface SelfHealingDiagnostics {
  failuresAnalyzed: number;
  repairsPlanned: number;
  repairAttempts: number;
  successfulRepairs: number;
  failedRepairs: number;
  interventionRequired: number;
  averageConfidence: number;
  repeatedFailures: number;
  retryStops: number;
}

export class SelfHealingAgent {
  private failuresAnalyzed = 0;
  private repairsPlanned = 0;
  private repairAttempts = 0;
  private successfulRepairs = 0;
  private failedRepairs = 0;
  private interventionRequiredCount = 0;
  private confidenceSum = 0;
  private repeatedFailuresCount = 0;
  private retryStopsCount = 0;

  public async handleFailure(event: FailureEvent): Promise<HealingLoopResult> {
    this.failuresAnalyzed++;
    
    const result = await healingLoopEngine.executeHealingLoop(event);
    
    this.repairAttempts += result.attemptsCount;
    this.confidenceSum += result.finalConfidence;

    if (result.status === 'healed') {
      this.successfulRepairs++;
      this.repairsPlanned++;
    } else if (result.status === 'halted') {
      this.interventionRequiredCount++;
      this.retryStopsCount++;
      if (result.interventionReason.toLowerCase().includes('repeated')) {
        this.repeatedFailuresCount++;
      }
    } else {
      this.failedRepairs++;
    }

    return result;
  }

  public getDiagnostics(): SelfHealingDiagnostics {
    const count = this.failuresAnalyzed || 1;
    return {
      failuresAnalyzed: this.failuresAnalyzed,
      repairsPlanned: this.repairsPlanned,
      repairAttempts: this.repairAttempts,
      successfulRepairs: this.successfulRepairs,
      failedRepairs: this.failedRepairs,
      interventionRequired: this.interventionRequiredCount,
      averageConfidence: Math.round(this.confidenceSum / count),
      repeatedFailures: this.repeatedFailuresCount,
      retryStops: this.retryStopsCount
    };
  }
}

export const selfHealingAgent = new SelfHealingAgent();
export default selfHealingAgent;
