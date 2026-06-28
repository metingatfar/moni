import { providerResponseCollector } from './ProviderResponseCollector';
import { consensusAnalyzer } from './ConsensusAnalyzer';
import { conflictResolver } from './ConflictResolver';
import { confidenceScorer } from './ConfidenceScorer';
import { consensusDecisionEngine } from './ConsensusDecisionEngine';
import { engineeringReasoner } from './EngineeringReasoner';
import { consensusMemory } from './ConsensusMemory';
import { consensusMetrics } from './ConsensusMetrics';
import type { ConsensusRequest } from './ConsensusRequest';
import type { ConsensusDecision } from './ConsensusDecisionEngine';
import type { ReasoningAudit } from './EngineeringReasoner';

export interface ConsensusEngineResult {
  decision: ConsensusDecision;
  audit: ReasoningAudit;
  analyzerResult: any;
  conflictDetails: any;
}

export class AIConsensusEngine {
  public async executeConsensus(
    request: ConsensusRequest,
    systemPrompt: string
  ): Promise<ConsensusEngineResult> {
    console.log(`[AIConsensusEngine] Executing consensus for request ${request.requestId}. Providers: ${request.providerList.join(', ')}`);

    // 1. Collect responses
    const responses = await providerResponseCollector.collectResponses(
      request.providerList,
      systemPrompt,
      request.engineeringTask
    );

    if (responses.size === 0) {
      throw new Error(`AIConsensusEngine failed to collect any responses from providers: ${request.providerList.join(', ')}`);
    }

    // 2. Analyze
    const analyzerResult = consensusAnalyzer.analyzeResponses(responses);

    // 3. Resolve conflicts
    const conflictDetails = conflictResolver.resolveConflicts(responses);

    // 4. Score confidence
    const scores = new Map<string, any>();
    const winRates = consensusMemory.getProviderWinRates();

    for (const [provider, res] of responses.entries()) {
      const winRate = winRates[provider] ?? 80; // Default winrate metric
      const score = confidenceScorer.scoreResponse(provider, res, winRate);
      scores.set(provider, score);
    }

    // 5. Decides best proposal
    const decision = consensusDecisionEngine.formulateDecision(
      responses,
      scores,
      conflictDetails.resolvedStrategy
    );

    // 6. Audit selected solution
    const audit = engineeringReasoner.auditSolution(decision);

    // 7. Log memory & metrics
    consensusMemory.logDecision(decision, audit);
    consensusMetrics.recordExecution(
      analyzerResult.agreementLevel,
      analyzerResult.disagreementLevel,
      conflictDetails.hasConflict,
      decision.confidence,
      audit.reasoningScore
    );

    return {
      decision,
      audit,
      analyzerResult,
      conflictDetails
    };
  }
}

export const aiConsensusEngine = new AIConsensusEngine();
export default aiConsensusEngine;
