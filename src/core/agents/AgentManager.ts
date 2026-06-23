import type { AgentContext } from './AgentContext';
import type { AgentResult } from './AgentResult';
import { agentRegistry } from './AgentRegistry';
import { eventBus } from '../events/EventBus';

export class AgentManager {
  private executionCount = 0;
  private failureCount = 0;
  private lastSelectedAgent = 'None';
  private lastAgentConfidence = 0.0;
  private lastAgentAction = 'None';
  private isConfirmationPending = false;

  public async route(input: string, context: AgentContext): Promise<AgentResult | null> {
    const agents = agentRegistry.getAgents();
    let bestAgent = null;
    let maxConfidence = 0;

    for (const agent of agents) {
      try {
        const canHandle = await agent.canHandle(input, context);
        if (canHandle) {
          // Trigger execution to fetch confidence details
          // Trigger execution to fetch confidence details
          const result = await agent.execute(input, context);
          
          let adjustedConfidence = result.confidence;
          try {
            const { agentMemory } = await import('../learning/AgentMemory');
            const mem = agentMemory.getOrCreate(agent.id);
            if (mem.executionCount > 0) {
              const successRate = mem.successCount / (mem.successCount + mem.failureCount || 1);
              const acceptanceRate = mem.acceptedCount / (mem.acceptedCount + mem.rejectedCount || 1);
              const performanceFactor = (successRate * 0.6) + (acceptanceRate * 0.4);
              adjustedConfidence = result.confidence * (0.9 + (performanceFactor * 0.2));
              adjustedConfidence = Math.min(1.0, Math.max(0.0, adjustedConfidence));
            }
          } catch (_) {}

          if (adjustedConfidence > maxConfidence) {
            maxConfidence = adjustedConfidence;
            bestAgent = { agent, result: { ...result, confidence: adjustedConfidence } };
          }
        }
      } catch (err) {
        console.error(`[AgentManager] Error checking agent ${agent.name}:`, err);
      }
    }

    if (bestAgent && maxConfidence >= 0.5) {
      const { agent, result } = bestAgent;
      
      this.lastSelectedAgent = agent.name;
      this.lastAgentConfidence = result.confidence;
      this.lastAgentAction = `Routed to ${agent.name}`;
      this.isConfirmationPending = result.requiresConfirmation;
      this.executionCount++;

      // Publish events
      eventBus.publish('AgentSelected', { agentId: agent.id, name: agent.name, confidence: result.confidence });
      eventBus.publish('AgentExecuted', { agentId: agent.id, success: result.success });
      
      if (result.requiresConfirmation) {
        eventBus.publish('AgentNeedsConfirmation', { agentId: agent.id, toolCalls: result.toolCalls });
      }
      if (result.toolCalls.length > 0) {
        eventBus.publish('AgentToolCallSuggested', { agentId: agent.id, toolCalls: result.toolCalls });
      }

      return result;
    }

    // No matching agent or low confidence -> fallback to AI Chat
    return null;
  }

  public recordFailure(): void {
    this.failureCount++;
    eventBus.publish('AgentFailed', { error: 'Execution failed or low confidence fallback' });
  }

  public clearConfirmationPending(): void {
    this.isConfirmationPending = false;
  }

  public getDiagnostics() {
    return {
      agentEngineStatus: 'Active',
      registeredAgentsCount: agentRegistry.getAgents().length,
      lastSelectedAgent: this.lastSelectedAgent,
      lastAgentConfidence: this.lastAgentConfidence,
      lastAgentAction: this.lastActionName(),
      agentExecutionCount: this.executionCount,
      agentFailureCount: this.failureCount,
      confirmationPending: this.isConfirmationPending
    };
  }

  private lastActionName(): string {
    return this.lastAgentAction;
  }
}
export const agentManager = new AgentManager();
