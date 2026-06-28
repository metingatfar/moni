export interface UserInteractionNode {
  targetId: string;
  clickCount: number;
}

export class UserJourneyAnalyzer {
  private interactions: Record<string, number> = {};

  public trackClick(targetId: string): void {
    this.interactions[targetId] = (this.interactions[targetId] || 0) + 1;
  }

  public getUnusedFeatures(allFeatures: string[]): string[] {
    return allFeatures.filter(f => !this.interactions[f]);
  }

  public getJourneyLogs() {
    return Object.entries(this.interactions).map(([targetId, clickCount]) => ({
      targetId,
      clickCount
    }));
  }
}
export const userJourneyAnalyzer = new UserJourneyAnalyzer();
export default userJourneyAnalyzer;
