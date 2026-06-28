import { container } from '../container/ServiceContainer';
import type { AgentReputationProfile } from './AgentReputationEngine';

export class ReputationMetrics {
  public getLeaderboard(): AgentReputationProfile[] {
    try {
      const repEngine = container.resolve<any>('AgentReputationEngine');
      if (repEngine) {
        return repEngine.getAllProfiles().sort((a: any, b: any) => b.accuracyScore - a.accuracyScore);
      }
    } catch (e) {
      console.warn('Could not resolve AgentReputationEngine for leaderboard:', e);
    }
    return [];
  }

  public getBestPerformingAgents(): AgentReputationProfile[] {
    const list = this.getLeaderboard();
    return list.slice(0, 3);
  }

  public getAccuracyRankings(): Array<{ agentName: string; accuracyScore: number }> {
    return this.getLeaderboard().map(p => ({
      agentName: p.agentName,
      accuracyScore: p.accuracyScore
    }));
  }

  public getLearningProgressSummary(): Array<{ agentName: string; progress: number }> {
    return this.getLeaderboard().map(p => ({
      agentName: p.agentName,
      progress: p.learningProgressIndex
    }));
  }

  public getExpertiseDistribution(): Record<string, number> {
    const profiles = this.getLeaderboard();
    const dist: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    profiles.forEach(p => {
      if (p.engineeringExpertiseRating >= 90) dist.High++;
      else if (p.engineeringExpertiseRating >= 80) dist.Medium++;
      else dist.Low++;
    });
    return dist;
  }
}
