import type { AgentTask } from './AgentTask';
import type { AgentVote } from './AgentVote';
import { agentRegistry } from '../agents/AgentRegistry';
import { eventBus } from '../events/EventBus';

export class AgentPipeline {
  private timeoutMs = 3000; // 3 seconds timeout guard

  public async run(task: AgentTask): Promise<AgentVote[]> {
    const votes: AgentVote[] = [];
    const executionPromises = task.requiredAgents.map(async (agentId) => {
      const agent = agentRegistry.getAgent(agentId);
      if (!agent) return;

      const startTime = Date.now();
      
      // Wrap agent execution with a timeout promise
      const agentPromise = (async () => {
        try {
          const result = await agent.execute(task.input, task.context);
          const executionTime = Date.now() - startTime;
          
          const vote: AgentVote = {
            agentId: agent.id,
            confidence: result.confidence,
            summary: result.message,
            risk: this.extractRisk(result),
            suggestedActions: result.toolCalls || [],
            executionTime
          };

          eventBus.publish('AgentVoteCreated', { agentId: agent.id, vote });
          return vote;
        } catch (e: any) {
          console.error(`[AgentPipeline] Agent ${agent.name} failed:`, e);
          return null;
        }
      })();

      // Timeout promise
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn(`[AgentPipeline] Agent ${agent.name} timed out after ${this.timeoutMs}ms.`);
          resolve(null);
        }, this.timeoutMs);
      });

      const res = await Promise.race([agentPromise, timeoutPromise]);
      if (res) {
        votes.push(res);
      }
    });

    await Promise.all(executionPromises);
    return votes;
  }

  private extractRisk(result: any): string {
    // Simple heuristic to extract risk warnings from message
    const msg = result.message.toLowerCase();
    if (msg.includes('risk') || msg.includes('dikkat') || msg.includes('yormadan') || msg.includes('zarar') || msg.includes('önemli')) {
      return result.message;
    }
    return '';
  }
}
