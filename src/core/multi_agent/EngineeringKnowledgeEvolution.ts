import { container } from '../container/ServiceContainer';

export interface EvolutionMilestone {
  milestoneId: string;
  timestamp: number;
  topic: string;
  extractedRule: string;
  sourceMeetingId: string;
  confidenceScore: number;
}

export class EngineeringKnowledgeEvolution {
  private milestones: EvolutionMilestone[] = [];
  private bestPractices: string[] = [
    'Always use constructor dependency injection interfaces.',
    'Execute all code generation inside isolated sandbox environments.',
    'Enforce verbatimModuleSyntax strict import flags in TypeScript compilers.'
  ];
  private engineeringTrends: string[] = [
    'Adoption of decentralized Multi-Agent communication channels.',
    'Transition from confidence-only consensus to reputation-weighted verification.',
    'Continuous learning feedback loop orchestration via persistent knowledge graphs.'
  ];

  public evolveKnowledge(
    meetingId: string,
    topic: string,
    decisions: string[],
    consensusScore: number
  ): EvolutionMilestone | null {
    if (decisions.length === 0) return null;

    const milestoneId = `evolve-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const extractedRule = `Evolved Rule from ${topic}: ${decisions[0]} (Verified via Consensus: ${consensusScore}%)`;

    const milestone: EvolutionMilestone = {
      milestoneId,
      timestamp: Date.now(),
      topic,
      extractedRule,
      sourceMeetingId: meetingId,
      confidenceScore: consensusScore
    };

    this.milestones.push(milestone);

    this.bestPractices.push(`Verify and enforce: ${decisions[0]}`);
    this.engineeringTrends.push(`Evolved trend in ${topic} using reputation-weighted consensus.`);

    try {
      const kb = container.resolve<any>('SharedKnowledgeBase');
      if (kb && kb.addRule) {
        kb.addRule('best_practices', `Evolved: ${topic}`, decisions[0]);
      }
    } catch (e) {
      console.warn('EngineeringKnowledgeEvolution failed to sync to SharedKnowledgeBase:', e);
    }

    try {
      const brain = container.resolve<any>('MONIBrain');
      if (brain) {
        const history = brain.getHistory();
        if (history && history.recordMilestone) {
          history.recordMilestone(
            'Sprint 6.5.1',
            'Knowledge Evolution',
            `Evolved best practice rule for ${topic}: ${decisions[0]}`,
            new Date().toISOString().split('T')[0],
            consensusScore
          );
        }

        const graph = brain.getGraph();
        if (graph && graph.addNode && graph.addEdge) {
          const nodeId = `node-evolve-${milestoneId}`;
          graph.addNode(nodeId, 'Dependency', `Knowledge Evolution: ${topic}`);
          graph.addEdge(`node-meeting-${meetingId}`, nodeId, 'evolved_into');
        }
      }
    } catch (e) {
      console.warn('EngineeringKnowledgeEvolution failed to sync to MONIBrain:', e);
    }

    return milestone;
  }

  public getMilestones(): EvolutionMilestone[] {
    return this.milestones;
  }

  public getBestPractices(): string[] {
    return this.bestPractices;
  }

  public getEngineeringTrends(): string[] {
    return this.engineeringTrends;
  }
}
