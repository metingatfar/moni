import { agentPerformanceTracker } from './AgentPerformanceTracker';
import { container } from '../container/ServiceContainer';

export class AgentFeedbackEngine {
  private lastTriggeredAgentId = 'goal_agent';
  private userAcceptedCount = 0;
  private userRejectedCount = 0;

  public setLastTriggeredAgent(agentId: string): void {
    this.lastTriggeredAgentId = agentId;
  }

  public detectFeedback(input: string): boolean {
    const text = input.toLowerCase().trim();
    
    const positiveKeywords = ['güzel öneri', 'bu işe yaradı', 'beğendim', 'harika öneri', 'onaylıyorum', 'evet onaylıyorum'];
    const negativeKeywords = ['bu olmadı', 'bu işe yaramadı', 'bunu sevmedim', 'böyle önerme', 'gereksiz öneri yapma', 'iptal et'];

    if (positiveKeywords.some(kw => text.includes(kw))) {
      this.userAcceptedCount++;
      agentPerformanceTracker.recordUserAccepted(this.lastTriggeredAgentId);
      console.log(`[AgentFeedbackEngine] Recorded positive feedback for: ${this.lastTriggeredAgentId}`);
      
      // Save preference fact to LongTermMemory securely
      try {
        const ltm = container.resolve<any>('LongTermMemory');
        if (ltm) {
          ltm.addFact(`Kullanıcı ${this.lastTriggeredAgentId} önerilerini faydalı buldu.`, 'preference', 0.8, 'implicit');
        }
      } catch (_) {}
      
      return true;
    }

    if (negativeKeywords.some(kw => text.includes(kw))) {
      this.userRejectedCount++;
      agentPerformanceTracker.recordUserRejected(this.lastTriggeredAgentId);
      console.log(`[AgentFeedbackEngine] Recorded negative feedback for: ${this.lastTriggeredAgentId}`);
      
      // Save preference fact to LongTermMemory securely
      try {
        const ltm = container.resolve<any>('LongTermMemory');
        if (ltm) {
          ltm.addFact(`Kullanıcı ${this.lastTriggeredAgentId} tarafından sunulan bazı önerileri reddetti veya beğenmedi.`, 'preference', 0.8, 'implicit');
        }
      } catch (_) {}
      
      return true;
    }

    return false;
  }

  public getAcceptanceRate(): number {
    const total = this.userAcceptedCount + this.userRejectedCount;
    if (total === 0) return 90; // Default high rate
    return Math.round((this.userAcceptedCount / total) * 100);
  }

  public getRejectionRate(): number {
    const total = this.userAcceptedCount + this.userRejectedCount;
    if (total === 0) return 10;
    return Math.round((this.userRejectedCount / total) * 100);
  }
}

export const agentFeedbackEngine = new AgentFeedbackEngine();
