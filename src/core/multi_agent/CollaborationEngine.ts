import { AgentCommunicationBus } from './AgentCommunicationBus';
import { ConversationManager } from './ConversationManager';
import { ConsensusEngine } from './ConsensusEngine';
import { NegotiationEngine } from './NegotiationEngine';
import { TaskDistributionEngine } from './TaskDistributionEngine';
import { AgentMemory } from './AgentMemory';
import { SharedKnowledgeBase } from './SharedKnowledgeBase';
import { CollaborationTimeline } from './CollaborationTimeline';
import { CollaborationMetrics } from './CollaborationMetrics';
import { ConflictManager } from './ConflictManager';
import { CollaborationReport } from './CollaborationReport';

export interface CollaborationSessionResult {
  discussionId: string;
  verdict: string;
  consensusScore: number;
  finalSolution: string;
  decisionsCount: number;
  conflictsFound: boolean;
}

export class CollaborationEngine {
  private bus = new AgentCommunicationBus();
  private convManager = new ConversationManager();
  private consensusEngine = new ConsensusEngine();
  private negEngine = new NegotiationEngine();
  private taskDistributor = new TaskDistributionEngine();
  private memory = new AgentMemory();
  private knowledgeBase = new SharedKnowledgeBase();
  private timeline = new CollaborationTimeline();
  private metrics = new CollaborationMetrics();
  private conflictManager = new ConflictManager();
  private reporter = new CollaborationReport();

  public async runSession(
    discussionId: string,
    problemSummary: string,
    agents: string[]
  ): Promise<CollaborationSessionResult> {
    const sessionName = `sess-${discussionId}`;
    this.timeline.recordStep(sessionName, 'Initialize', `Started collaborative discussion session: ${problemSummary}`);

    // 1. Task Distribution
    this.timeline.recordStep(sessionName, 'Task Distribution', 'Assigning coding & architecture review tasks.');
    const tasks = [
      { name: 'Review database indexes', priority: 4 },
      { name: 'Implement strict authentication gates', priority: 5 },
      { name: 'Analyze presentation decoupling', priority: 3 }
    ];
    const assignments = this.taskDistributor.distributeTasks(tasks, agents, 'priority');
    assignments.forEach(assign => {
      this.bus.sendDirect('Coordinator', assign.assignedAgent, 'task_assignment', assign.taskName);
    });

    // 2. Parallel Discussions & Negotiation
    this.timeline.recordStep(sessionName, 'Discussions', 'AI agents publishing analysis trade-offs.');
    this.convManager.addEntry(discussionId, 'LeadArchitectAgent', 'question', 'What is the optimal tech stack layout?');
    
    const proposals = [
      {
        topic: 'architecture' as const,
        proposingAgent: 'BackendDeveloperAgent',
        proposedSolution: 'Layer architecture with Repository Pattern',
        reasoning: 'Reduces coupling and separates domain rules.',
        complexity: 'Medium' as const,
        durationMinutes: 15
      },
      {
        topic: 'architecture' as const,
        proposingAgent: 'LeadArchitectAgent',
        proposedSolution: 'Decoupled Hexagonal Ports & Adapters design',
        reasoning: 'Strict decoupling gate constraints.',
        complexity: 'High' as const,
        durationMinutes: 20
      }
    ];

    const negResult = this.negEngine.negotiate('architecture', proposals);
    this.convManager.addEntry(discussionId, 'Coordinator', 'recommendation', `Negotiation compromise outcome: ${negResult.finalSolution}`);

    // 3. Conflict Auditing
    this.timeline.recordStep(sessionName, 'Conflict Resolution', 'Auditing agent recommendations for layer violations.');
    const auditInputs = proposals.map(p => ({
      agent: p.proposingAgent,
      codePatch: p.proposedSolution,
      layer: p.topic === 'architecture' ? 'domain' : 'presentation'
    }));
    const auditRes = this.conflictManager.auditProposals(auditInputs);

    // 4. Consensus computation
    this.timeline.recordStep(sessionName, 'Consensus Evaluation', 'Evaluating consensus score indexes.');
    const consensusInputs = agents.map((agent, idx) => ({
      agentName: agent,
      confidence: 85 + (idx * 2),
      expertise: 90 - (idx * 3),
      risk: 15 + (idx * 5),
      historicalAccuracy: 92 + (idx % 2)
    }));
    const consensus = this.consensusEngine.computeConsensus(consensusInputs);

    // 5. Store engineering decisions
    this.timeline.recordStep(sessionName, 'Decision Persistence', 'Recording finalized consensus choices.');
    this.memory.recordDecision(
      discussionId,
      'Architecture Layout Design',
      negResult.finalSolution,
      consensus.reasoning,
      consensus.consensusScore
    );

    // Record metrics
    this.metrics.recordSession(15, consensus.consensusScore, auditRes.conflictFound ? 1 : 0, 1);

    // 6. Generate 12 reports
    this.timeline.recordStep(sessionName, 'Report Compilation', 'Writing cumulative session reports to reports/ folder.');
    this.reporter.writeAllCollaborationReports({
      discussionId,
      verdict: consensus.verdict,
      consensusScore: consensus.consensusScore,
      activeAgents: agents,
      timelineEventsCount: this.timeline.getEvents(sessionName).length,
      conflictsFound: auditRes.conflictFound,
      conflictDescription: auditRes.conflictDescription,
      decisionsRecordedCount: this.memory.getDecisions().length,
      finalSolution: negResult.finalSolution
    });

    return {
      discussionId,
      verdict: consensus.verdict,
      consensusScore: consensus.consensusScore,
      finalSolution: negResult.finalSolution,
      decisionsCount: this.memory.getDecisions().length,
      conflictsFound: auditRes.conflictFound
    };
  }

  // Getters for integration validation
  public getBus() { return this.bus; }
  public getConvManager() { return this.convManager; }
  public getConsensusEngine() { return this.consensusEngine; }
  public getNegEngine() { return this.negEngine; }
  public getTaskDistributor() { return this.taskDistributor; }
  public getMemory() { return this.memory; }
  public getKnowledgeBase() { return this.knowledgeBase; }
  public getTimeline() { return this.timeline; }
  public getMetrics() { return this.metrics; }
  public getConflictManager() { return this.conflictManager; }
}
