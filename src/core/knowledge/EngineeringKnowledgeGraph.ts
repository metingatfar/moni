import type { KnowledgeDocument } from './KnowledgeDocument';

export interface GraphNode {
  id: string;
  label: string;
  type: 'sprint' | 'module' | 'adr' | 'debt' | 'concept';
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface VocabularyTerm {
  term: string;
  definition: string;
  conceptArea: string;
}

export class EngineeringKnowledgeGraph {
  private nodes: GraphNode[] = [];
  private edges: GraphEdge[] = [];
  private vocabulary: VocabularyTerm[] = [
    {
      term: 'Repository Intelligence',
      definition: 'Decoupled in-memory index mapping repo architecture and files in read-only mode.',
      conceptArea: 'Intelligence Layer'
    },
    {
      term: 'Code Intelligence',
      definition: 'Deep symbol parser indexing functions, classes, and call graphs.',
      conceptArea: 'Intelligence Layer'
    },
    {
      term: 'Developer Agent',
      definition: 'Planner engine formulating implementation steps matching user requirements.',
      conceptArea: 'Reasoning Layer'
    },
    {
      term: 'Sandbox Workspace',
      definition: 'Isolated scratchpad executing build commands to prevent real code corruption.',
      conceptArea: 'Execution Layer'
    },
    {
      term: 'Consensus Engine',
      definition: 'Decentralized synthesis system checking provider votes to resolve engineering conflicts.',
      conceptArea: 'Multi-Agent Layer'
    },
    {
      term: 'Architectural Memory',
      definition: 'Self-indexing system recording sprint timeline history, Module Histories, and ADRs.',
      conceptArea: 'Knowledge Layer'
    }
  ];

  constructor() {
    this.buildGraph();
  }

  private buildGraph(): void {
    // 1. Add nodes
    this.nodes.push({ id: 'sprint-4.3-c', label: 'Sprint 4.3-C', type: 'sprint' });
    this.nodes.push({ id: 'sprint-4.3-d', label: 'Sprint 4.3-D', type: 'sprint' });
    this.nodes.push({ id: 'module-consensus', label: 'AIConsensusEngine', type: 'module' });
    this.nodes.push({ id: 'module-knowledge', label: 'KnowledgeBaseEngine', type: 'module' });
    this.nodes.push({ id: 'adr-0003', label: 'ADR-0003', type: 'adr' });
    this.nodes.push({ id: 'concept-consensus', label: 'Consensus voting', type: 'concept' });

    // 2. Add edges
    this.edges.push({ source: 'sprint-4.3-c', target: 'module-consensus', relation: 'introduced' });
    this.edges.push({ source: 'sprint-4.3-d', target: 'module-knowledge', relation: 'introduced' });
    this.edges.push({ source: 'module-consensus', target: 'adr-0003', relation: 'governed_by' });
    this.edges.push({ source: 'module-consensus', target: 'concept-consensus', relation: 'implements' });
  }

  public getGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
    return {
      nodes: this.nodes,
      edges: this.edges
    };
  }

  public getVocabulary(): VocabularyTerm[] {
    return this.vocabulary;
  }

  public getDocuments(): KnowledgeDocument[] {
    return this.vocabulary.map((vocab, idx) => ({
      id: `VOCAB-${(idx + 1).toString().padStart(4, '0')}`,
      title: vocab.term,
      category: 'vocabulary' as const,
      content: `Term: ${vocab.term}\nConcept Area: ${vocab.conceptArea}\nDefinition: ${vocab.definition}`,
      sprint: 9,
      metadata: vocab,
      timestamp: new Date().toISOString()
    }));
  }
}

export const engineeringKnowledgeGraph = new EngineeringKnowledgeGraph();
export default engineeringKnowledgeGraph;
