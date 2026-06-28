export interface HealingRecord {
  failureId: string;
  attemptNumber: number;
  strategyUsed: string;
  success: boolean;
  confidenceScore: number;
  errorMessage: string;
  timestamp: string;
}

export class HealingHistory {
  private records: HealingRecord[] = [];

  public addRecord(record: HealingRecord): void {
    this.records.push(record);
  }

  public getHistory(failureId: string): HealingRecord[] {
    return this.records.filter(r => r.failureId === failureId);
  }

  public hasRepeatedFailures(failureId: string, limit = 2): boolean {
    const history = this.getHistory(failureId);
    if (history.length < limit) return false;
    
    // Check if the last two attempts failed with the same strategy
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    return !last.success && !prev.success && last.strategyUsed === prev.strategyUsed;
  }

  public clear(): void {
    this.records = [];
  }
}

export const healingHistory = new HealingHistory();
export default healingHistory;
