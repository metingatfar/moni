import type { AgentContext } from '../agents/AgentContext';
import type { AgentResult } from '../agents/AgentResult';
import type { AgentTask } from './AgentTask';
import { AgentCoordinator } from './AgentCoordinator';
import { AgentPipeline } from './AgentPipeline';
import { AgentConsensus } from './AgentConsensus';
import { eventBus } from '../events/EventBus';
import { agentRegistry } from '../agents/AgentRegistry';
import { smartCache } from '../learning/SmartCache';
import { costOptimizer } from '../learning/CostOptimizer';
import { conflictResolver } from '../learning/ConflictResolver';
import { agentPerformanceTracker } from '../learning/AgentPerformanceTracker';
import { agentFeedbackEngine } from '../learning/AgentFeedbackEngine';

export class MultiAgentEngine {
  private coordinator = new AgentCoordinator();
  private pipeline = new AgentPipeline();
  private consensus = new AgentConsensus();

  // Metrics tracking
  private executionCount = 0;
  private fallbackCount = 0;
  private lastConsensusConfidence = 0.0;
  private avgAgentConfidence = 0.0;
  private lastPipelineTime = 0;
  private lastWinningAgent = 'None';
  private lastActiveAgents: string[] = [];

  public async executeTask(userInput: string, context: AgentContext): Promise<AgentResult | null> {
    const startTime = Date.now();
    this.executionCount++;

    eventBus.publish('MultiAgentStarted', { userInput });

    // 1. Cache Lookup
    const cacheKey = `multiagent-task-${userInput.toLowerCase().trim()}`;
    const cachedResult = smartCache.get<AgentResult>(cacheKey);
    if (cachedResult) {
      console.log(`[MultiAgentEngine] Cache hit for: ${userInput}`);
      eventBus.publish('MultiAgentFinished', { success: true, result: cachedResult, cached: true });
      return cachedResult;
    }

    // 2. Cost Optimization
    if (costOptimizer.shouldSkipPipeline(userInput, context.activeGoals || [])) {
      console.log(`[MultiAgentEngine] CostOptimizer requested pipeline bypass.`);
      this.recordFallback();
      return null;
    }

    // 3. Coordinate / Determine required agents
    const requiredAgents = this.coordinator.determineRequiredAgents(userInput, context);
    this.lastActiveAgents = requiredAgents;

    if (requiredAgents.length === 0) {
      console.log('[MultiAgentEngine] No agents mapped to user input.');
      this.recordFallback();
      return null;
    }

    // 4. Build Task object
    const task: AgentTask = {
      id: `task-${Date.now()}`,
      input: userInput,
      intent: 'collaborative_resolution',
      context,
      requiredAgents,
      priority: 'medium',
      createdAt: new Date().toISOString()
    };

    // 5. Execute Pipeline
    let votes = [];
    try {
      votes = await this.pipeline.run(task);
    } catch (err) {
      console.error('[MultiAgentEngine] Pipeline execution error:', err);
      this.recordFallback();
      return null;
    }

    this.lastPipelineTime = Date.now() - startTime;

    if (votes.length === 0) {
      console.warn('[MultiAgentEngine] All agents timed out or failed.');
      this.recordFallback();
      return null;
    }

    // 6. Conflict Resolution
    votes = conflictResolver.resolveConflicts(votes);

    // Calculate metrics
    const totalConf = votes.reduce((acc, v) => acc + v.confidence, 0);
    this.avgAgentConfidence = totalConf / votes.length;

    // 7. Resolve Consensus
    const consensusResult = this.consensus.resolve(votes);
    this.lastConsensusConfidence = consensusResult.confidence;

    // Determine winning agent (one with highest confidence)
    let bestVote = votes[0];
    for (const vote of votes) {
      if (vote.confidence > bestVote.confidence) {
        bestVote = vote;
      }
    }
    this.lastWinningAgent = bestVote ? bestVote.agentId : 'None';
    
    // Set last triggered agent for user feedback tracking
    agentFeedbackEngine.setLastTriggeredAgent(this.lastWinningAgent);

    // Record agent execution stats
    votes.forEach(vote => {
      agentPerformanceTracker.recordExecution(vote.agentId, vote.executionTime, vote.confidence);
      if (vote.confidence >= 0.5) {
        agentPerformanceTracker.recordSuccess(vote.agentId);
      } else {
        agentPerformanceTracker.recordFailure(vote.agentId);
      }
    });

    eventBus.publish('ConsensusCompleted', { consensusResult });

    // 8. Fallback check if consensus confidence is low
    if (consensusResult.confidence < 0.5) {
      console.warn(`[MultiAgentEngine] Consensus confidence too low (${consensusResult.confidence}). Falling back.`);
      this.recordFallback();
      return null;
    }

    // Save to Cache
    smartCache.set(cacheKey, consensusResult, 5 * 60 * 1000); // 5 minutes TTL

    eventBus.publish('MultiAgentFinished', { success: true, result: consensusResult });
    return consensusResult;
  }

  private recordFallback(): void {
    this.fallbackCount++;
    eventBus.publish('MultiAgentFallback', { reason: 'Confidence low, timeout, or no agents' });
  }

  public getDiagnostics() {
    return {
      registeredAgentsCount: agentRegistry.getAgents().length,
      activeAgentsCount: this.lastActiveAgents.length,
      activeAgentsList: this.lastActiveAgents,
      consensusConfidence: this.lastConsensusConfidence,
      averageAgentConfidence: this.avgAgentConfidence,
      pipelineTime: this.lastPipelineTime,
      totalVotes: this.lastActiveAgents.length,
      winningAgent: this.lastWinningAgent,
      fallbackUsed: this.fallbackCount > 0,
      fallbackCount: this.fallbackCount,
      duplicateActionsPrevented: this.consensus.getDuplicatePreventedCount()
    };
  }
}

export const multiAgentEngine = new MultiAgentEngine();
