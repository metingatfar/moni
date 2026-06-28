import { agentRegistry } from './AgentRegistry';
import { taskAssignmentEngine } from './TaskAssignmentEngine';
import { agentCommunicationBus } from './AgentCommunicationBus';
import { collaborationPlanner } from './CollaborationPlanner';
import { agentDecisionMerger } from './AgentDecisionMerger';
import { collaborationRiskAnalyzer } from './CollaborationRiskAnalyzer';
import { agentMemory } from './AgentMemory';
import { collaborationMetrics } from './CollaborationMetrics';
import { multiAgentCollaborationReport } from './MultiAgentCollaborationReport';
import type { CollaborationSession } from './CollaborationSession';

export class MultiAgentCollaborationEngine {
  private sessions: Map<string, CollaborationSession> = new Map();
  private totalConflicts = 0;
  private totalDecisions = 0;

  public async runCollaboration(request: string): Promise<CollaborationSession> {
    const sessionId = `collab-sess-${Date.now()}`;
    collaborationMetrics.incrementActiveSessions();

    // 1. Planner
    const tasks = collaborationPlanner.planCollaboration(request);
    
    // 2. Assign tasks
    const activeAgentsList = agentRegistry.getAllAgents();
    for (const task of tasks) {
      taskAssignmentEngine.assignTask(task);
    }

    // 3. Messages & communication mock simulation
    agentCommunicationBus.clear();
    agentCommunicationBus.sendMessage('project-manager', 'all', 'Proposal', `Decomposed requirements for: ${request}`);
    agentCommunicationBus.sendMessage('autonomous-coding-agent', 'ai-consensus-engine', 'Proposal', 'Drafted engineering implementation patch suggestions.');
    agentCommunicationBus.sendMessage('ai-consensus-engine', 'all', 'Approval', 'Verified conflict consensus of proposal patches.');
    
    // Simulate task running and completing
    for (const task of tasks) {
      task.status = 'completed';
      task.result = `Successfully executed: ${task.title}`;
    }
    collaborationMetrics.trackTasks(tasks.length, tasks.length);

    // 4. Decision merger
    const decisionsMock = [
      { agentId: 'autonomous-coding-agent', priority: 'critical', confidence: 90, recommendation: 'Apply modular class pattern.' },
      { agentId: 'ai-consensus-engine', priority: 'critical', confidence: 96, recommendation: 'Apply modular class pattern.' }
    ];
    const merged = agentDecisionMerger.mergeDecisions(decisionsMock);
    this.totalDecisions += decisionsMock.length;
    this.totalConflicts += merged.conflictsResolved.length;
    collaborationMetrics.trackConflicts(merged.conflictsResolved.length, decisionsMock.length);

    // 5. Risk analyzer
    const risks = collaborationRiskAnalyzer.analyzeRisks(tasks, activeAgentsList);
    const riskSeverity = risks.some(r => r.severity === 'high') ? 'high' : risks.some(r => r.severity === 'medium') ? 'medium' : 'low';

    // 6. Metrics & Memory
    const kpis = collaborationMetrics.getKPIs();
    collaborationMetrics.completeSession(merged.consensusScore);

    agentMemory.recordCollaboration({
      sessionId,
      agentsParticipated: activeAgentsList.map(a => a.agentId),
      success: merged.consensusScore >= 70,
      score: kpis.collaborationQualityScore,
      conflictsCount: merged.conflictsResolved.length,
      timestamp: new Date().toISOString()
    });

    const session: CollaborationSession = {
      sessionId,
      name: `Collaborative solution for: ${request}`,
      status: 'completed',
      assignedTasks: tasks,
      messages: agentCommunicationBus.getAllMessages(),
      decisions: [merged.resolvedOutput],
      risksDetected: risks.map(r => r.description),
      finalOutput: merged.resolvedOutput,
      collaborationScore: kpis.collaborationQualityScore
    };

    this.sessions.set(sessionId, session);

    // 7. Report Generation
    multiAgentCollaborationReport.generateReports({
      sessionId,
      name: session.name,
      tasksCount: tasks.length,
      messagesCount: session.messages.length,
      conflictsCount: merged.conflictsResolved.length,
      riskLevel: riskSeverity,
      collaborationScore: kpis.collaborationQualityScore,
      consensusScore: merged.consensusScore,
      resolvedOutput: merged.resolvedOutput
    });

    return session;
  }

  public getDiagnostics(): {
    collaborationSessions: number;
    activeAgents: number;
    assignedTasks: number;
    messagesExchanged: number;
    conflictsDetected: number;
    decisionsMerged: number;
    averageConfidence: number;
    collaborationScore: number;
  } {
    const kpis = collaborationMetrics.getKPIs();
    let totalTasks = 0;
    let totalMessages = 0;
    
    for (const s of this.sessions.values()) {
      totalTasks += s.assignedTasks.length;
      totalMessages += s.messages.length;
    }

    return {
      collaborationSessions: this.sessions.size,
      activeAgents: agentRegistry.getAllAgents().length,
      assignedTasks: totalTasks,
      messagesExchanged: totalMessages,
      conflictsDetected: this.totalConflicts,
      decisionsMerged: this.totalDecisions,
      averageConfidence: kpis.averageConfidence,
      collaborationScore: kpis.collaborationQualityScore
    };
  }

  public clear(): void {
    this.sessions.clear();
    this.totalConflicts = 0;
    this.totalDecisions = 0;
    collaborationMetrics.clear();
    agentMemory.clear();
  }
}

export const multiAgentCollaborationEngine = new MultiAgentCollaborationEngine();
export default multiAgentCollaborationEngine;
