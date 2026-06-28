import { container } from '../container/ServiceContainer';

export interface AgentReputationProfile {
  agentName: string;
  accuracyScore: number;
  historicalSuccessRate: number;
  failedRecommendationCount: number;
  averageConfidence: number;
  engineeringExpertiseRating: number;
  securityAccuracy: number;
  performanceAccuracy: number;
  architectureAccuracy: number;
  qaAccuracy: number;
  documentationAccuracy: number;
  acceptedRecommendations: number;
  rejectedRecommendations: number;
  totalReviews: number;
  learningProgressIndex: number;
}

export class AgentReputationEngine {
  private profiles: Map<string, AgentReputationProfile> = new Map();

  constructor() {
    this.initializeDefaultProfiles();
  }

  private initializeDefaultProfiles(): void {
    const agents = [
      'LeadArchitectAgent',
      'BackendDeveloperAgent',
      'FrontendDeveloperAgent',
      'MobileDeveloperAgent',
      'DatabaseArchitectAgent',
      'DevOpsEngineerAgent',
      'SecurityEngineerAgent',
      'PerformanceEngineerAgent',
      'QAEngineerAgent',
      'DocumentationEngineerAgent',
      'UXReviewerAgent',
      'CodeReviewerAgent',
      'RefactoringAgent',
      'BugHunterAgent',
      'StaticAnalysisAgent',
      'DependencyAuditAgent'
    ];

    agents.forEach((agent, index) => {
      const baseAccuracy = 88 + (index % 3) * 3;
      const baseConfidence = 85 + (index % 4) * 2;
      const baseExpertise = 90 - (index % 2) * 5;
      
      this.profiles.set(agent, {
        agentName: agent,
        accuracyScore: baseAccuracy,
        historicalSuccessRate: baseAccuracy - 2,
        failedRecommendationCount: 0,
        averageConfidence: baseConfidence,
        engineeringExpertiseRating: baseExpertise,
        securityAccuracy: baseAccuracy + 1,
        performanceAccuracy: baseAccuracy - 1,
        architectureAccuracy: baseAccuracy,
        qaAccuracy: baseAccuracy + 2,
        documentationAccuracy: baseAccuracy - 2,
        acceptedRecommendations: 10 + (index * 2),
        rejectedRecommendations: 1,
        totalReviews: 11 + (index * 2),
        learningProgressIndex: 75 + (index % 5) * 4
      });
    });
  }

  public getProfile(agentName: string): AgentReputationProfile {
    const profile = this.profiles.get(agentName);
    if (!profile) {
      return {
        agentName,
        accuracyScore: 90,
        historicalSuccessRate: 90,
        failedRecommendationCount: 0,
        averageConfidence: 85,
        engineeringExpertiseRating: 90,
        securityAccuracy: 90,
        performanceAccuracy: 90,
        architectureAccuracy: 90,
        qaAccuracy: 90,
        documentationAccuracy: 90,
        acceptedRecommendations: 5,
        rejectedRecommendations: 0,
        totalReviews: 5,
        learningProgressIndex: 80
      };
    }
    return profile;
  }

  public getAllProfiles(): AgentReputationProfile[] {
    return Array.from(this.profiles.values());
  }

  public updateProfile(agentName: string, success: boolean, confidence: number, topic: string): void {
    const profile = this.profiles.get(agentName);
    if (profile) {
      profile.totalReviews += 1;
      if (success) {
        profile.acceptedRecommendations += 1;
      } else {
        profile.rejectedRecommendations += 1;
        profile.failedRecommendationCount += 1;
      }
      
      profile.historicalSuccessRate = Math.round((profile.acceptedRecommendations / profile.totalReviews) * 100);
      profile.averageConfidence = Math.round(((profile.averageConfidence * (profile.totalReviews - 1)) + confidence) / profile.totalReviews);
      profile.accuracyScore = Math.round((profile.historicalSuccessRate * 0.7) + (profile.averageConfidence * 0.3));
      
      if (success) {
        profile.learningProgressIndex = Math.min(100, profile.learningProgressIndex + 2);
      } else {
        profile.learningProgressIndex = Math.min(100, profile.learningProgressIndex + 5);
      }

      if (topic === 'security') {
        profile.securityAccuracy = Math.round(profile.securityAccuracy * 0.9 + (success ? 10 : 0));
      } else if (topic === 'performance') {
        profile.performanceAccuracy = Math.round(profile.performanceAccuracy * 0.9 + (success ? 10 : 0));
      } else if (topic === 'architecture') {
        profile.architectureAccuracy = Math.round(profile.architectureAccuracy * 0.9 + (success ? 10 : 0));
      } else if (topic === 'qa') {
        profile.qaAccuracy = Math.round(profile.qaAccuracy * 0.9 + (success ? 10 : 0));
      } else if (topic === 'documentation') {
        profile.documentationAccuracy = Math.round(profile.documentationAccuracy * 0.9 + (success ? 10 : 0));
      }

      this.profiles.set(agentName, profile);
      this.syncWithBrain(agentName, profile);
    }
  }

  private syncWithBrain(agentName: string, profile: AgentReputationProfile): void {
    try {
      const brain = container.resolve<any>('MONIBrain');
      if (brain && brain.getMemory) {
        const mem = brain.getMemory();
        if (mem && mem.addTask) {
          mem.addTask(`Synchronized reputation for agent ${agentName}: Accuracy = ${profile.accuracyScore}%, Success Rate = ${profile.historicalSuccessRate}%`, 'completed');
        }
      }
    } catch (e) {
      console.warn('Failed to sync reputation with MONIBrain:', e);
    }
  }
}
