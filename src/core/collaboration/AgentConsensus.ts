import type { AgentVote } from './AgentVote';
import type { AgentResult } from '../agents/AgentResult';

export class AgentConsensus {
  private duplicatePreventedCount = 0;

  public resolve(votes: AgentVote[]): AgentResult {
    if (votes.length === 0) {
      return {
        success: false,
        message: "Ajanlar arasında uzlaşı sağlanamadı.",
        actions: [],
        events: [],
        confidence: 0,
        requiresConfirmation: false,
        suggestedNextSteps: [],
        toolCalls: []
      };
    }

    // 1. Calculate confidence metrics
    const totalConfidence = votes.reduce((acc, v) => acc + v.confidence, 0);
    const avgConfidence = totalConfidence / votes.length;

    // 2. Identify risks and synthesize summaries
    const risks = votes.filter(v => v.risk).map(v => v.risk);
    const summaries = votes.map(v => `[${v.agentId}]: ${v.summary}`);
    
    let consolidatedMessage = summaries.join('\n');
    if (risks.length > 0) {
      // Prepend risks
      consolidatedMessage = `⚠️ [UYARI] ${risks.join(' | ')}\n\n${consolidatedMessage}`;
    }

    // 3. Deduplicate Suggested Actions
    const mergedActionsMap = new Map<string, { tool: string; params: any }>();
    for (const vote of votes) {
      for (const action of vote.suggestedActions) {
        // Unique key based on tool and title/params
        const title = action.params?.title || action.params?.message || JSON.stringify(action.params);
        const key = `${action.tool}-${title.toLowerCase().trim()}`;
        
        if (mergedActionsMap.has(key)) {
          this.duplicatePreventedCount++;
          console.log(`[AgentConsensus] Prevented duplicate action: ${key}`);
        } else {
          mergedActionsMap.set(key, action);
        }
      }
    }

    const toolCalls = Array.from(mergedActionsMap.values());
    
    // 4. Determine if confirmation is needed (safe default: if any tool calls are present, require confirmation)
    const requiresConfirmation = toolCalls.length > 0;

    return {
      success: true,
      message: consolidatedMessage,
      actions: votes.map(v => v.agentId),
      events: [],
      confidence: avgConfidence,
      requiresConfirmation,
      suggestedNextSteps: [],
      toolCalls
    };
  }

  public getDuplicatePreventedCount(): number {
    return this.duplicatePreventedCount;
  }
}
