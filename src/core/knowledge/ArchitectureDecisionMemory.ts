import type { KnowledgeDocument } from './KnowledgeDocument';

export interface ADR {
  id: string; // ADR-0001, ADR-0002, etc.
  title: string;
  decision: string;
  reason: string;
  alternativesConsidered: string[];
  whyRejected: string[];
  consequences: string;
  timestamp: string;
}

export class ArchitectureDecisionMemory {
  private adrs: ADR[] = [
    {
      id: 'ADR-0001',
      title: 'Read-only Repository Intelligence',
      decision: 'Keep Repository Intelligence scanner read-only in memory.',
      reason: 'To guarantee that the analyzer does not inadvertently corrupt or rewrite codebase files during project analysis.',
      alternativesConsidered: ['Self-healing Repository Scanner', 'Git-monitored Auto-commit Scanners'],
      whyRejected: [
        'Writing features during scanning introduces huge corruption risks.',
        'Harder to audit and verify.'
      ],
      consequences: 'Safe, predictable repository mapping. Zero write access for analyzer runs.',
      timestamp: '2026-06-10T12:00:00Z'
    },
    {
      id: 'ADR-0002',
      title: 'Mandatory Sandbox Workspace Validation',
      decision: 'Enforce complete sandbox folder isolated checks for all generated patch applications.',
      reason: 'To avoid broken compilation, test regressions, or unverified changes entering production.',
      alternativesConsidered: ['In-place production patch trials', 'Virtual FS in-memory simulators'],
      whyRejected: [
        'Direct editing has zero rollback safety.',
        'In-memory simulation fails to catch real build/compilation toolchain breaks.'
      ],
      consequences: 'Every patch proposal must succeed in building under the sandbox directory before it can be marked ready.',
      timestamp: '2026-06-20T14:30:00Z'
    },
    {
      id: 'ADR-0003',
      title: 'Multi-Provider Consensus Engine Routing',
      decision: 'Run multiple models concurrently and synthesize decisions via AIConsensusEngine instead of relying on a single provider.',
      reason: 'To reduce hallucinations, improve coding architecture, and eliminate vendor lock-in.',
      alternativesConsidered: ['Single model orchestrator routing', 'Sequential fallback chains'],
      whyRejected: [
        'Single models fail to catch their own errors.',
        'Fallback chains increase latency without providing comparative analysis.'
      ],
      consequences: 'Engineering solutions are voted upon and audited, selecting the highest-scoring model decision.',
      timestamp: '2026-06-24T08:00:00Z'
    },
    {
      id: 'ADR-0004',
      title: 'Apply Preparation & Readiness Scoring',
      decision: 'Introduce a formal preparation manifest stage with readiness scores.',
      reason: 'To make sure changes are fully prepared, verified, and score-assessed prior to user intervention.',
      alternativesConsidered: ['Direct prompt-to-apply', 'Standard developer manual review'],
      whyRejected: [
        'Auto-applies skip verification rules.',
        'Manual review does not provide automated safety stats.'
      ],
      consequences: 'Creates a clean, audit-logged manifest showing compilation, regressions, and approval checklist details.',
      timestamp: '2026-06-22T09:00:00Z'
    }
  ];

  public getADRs(): ADR[] {
    return this.adrs;
  }

  public getDocuments(): KnowledgeDocument[] {
    return this.adrs.map(adr => ({
      id: adr.id,
      title: adr.title,
      category: 'decision' as const,
      content: `ADR: ${adr.id} - ${adr.title}\nDecision: ${adr.decision}\nReason: ${adr.reason}\nAlternatives: ${adr.alternativesConsidered.join(', ')}\nRejected Reasons: ${adr.whyRejected.join(', ')}\nConsequences: ${adr.consequences}`,
      sprint: 9,
      metadata: adr,
      timestamp: adr.timestamp
    }));
  }
}

export const architectureDecisionMemory = new ArchitectureDecisionMemory();
export default architectureDecisionMemory;
