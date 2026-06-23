import { KnowledgeGraph } from './KnowledgeGraph';
import { PersonalKnowledge } from './PersonalKnowledge';
import { WorldKnowledge } from './WorldKnowledge';
import { ProjectKnowledge } from './ProjectKnowledge';

export interface SemanticSearchResult {
  score: number;
  source: 'graph' | 'personal' | 'world' | 'project';
  nodeId?: string;
  title: string;
  content: string;
}

export class SemanticSearch {
  private graph: KnowledgeGraph;
  private personal: PersonalKnowledge;
  private world: WorldKnowledge;
  private project: ProjectKnowledge;

  constructor(
    graph: KnowledgeGraph,
    personal: PersonalKnowledge,
    world: WorldKnowledge,
    project: ProjectKnowledge
  ) {
    this.graph = graph;
    this.personal = personal;
    this.world = world;
    this.project = project;
  }

  /**
   * Search query over knowledge sources and return scored results.
   */
  public search(query: string): SemanticSearchResult[] {
    const results: SemanticSearchResult[] = [];
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) return results;

    // 1. Search Personal Facts
    const personalFacts = this.personal.getAllFacts();
    for (const fact of personalFacts) {
      let matchScore = this.calculateSimilarity(lowerQuery, `${fact.category} ${fact.value}`);
      
      // Intent/synonym mapping for personal facts (e.g. "ben kimim" query)
      if (fact.category === 'identity' && (lowerQuery.includes('kimim') || lowerQuery.includes('ben') || lowerQuery.includes('adım') || lowerQuery.includes('adim'))) {
        matchScore = Math.max(matchScore, 0.9);
      }
      if (fact.category === 'sport' && (lowerQuery.includes('spor') || lowerQuery.includes('hobi') || lowerQuery.includes('aktivite'))) {
        matchScore = Math.max(matchScore, 0.8);
      }

      if (matchScore > 0.1) {
        results.push({
          score: matchScore,
          source: 'personal',
          title: `Kişisel Bilgi: ${fact.category}`,
          content: fact.value
        });
      }
    }

    // 2. Search World Facts
    const worldFacts = this.world.getAllWorldFacts();
    for (const fact of worldFacts) {
      const matchScore = this.calculateSimilarity(lowerQuery, `${fact.topic} ${fact.category} ${fact.description}`);
      if (matchScore > 0.1) {
        results.push({
          score: matchScore,
          source: 'world',
          title: `Dünya Bilgisi: ${fact.topic}`,
          content: fact.description
        });
      }
    }

    // 3. Search Project Facts
    const projects = this.project.getAllProjects();
    for (const proj of projects) {
      const componentsStr = proj.components.join(' ');
      const matchScore = this.calculateSimilarity(lowerQuery, `${proj.projectName} ${proj.architectureVersion} ${componentsStr}`);
      if (matchScore > 0.1) {
        results.push({
          score: matchScore,
          source: 'project',
          title: `Proje Bilgisi: ${proj.projectName}`,
          content: `Sürüm: ${proj.architectureVersion}, Bileşenler: ${proj.components.join(', ')}`
        });
      }
    }

    // 4. Search Knowledge Graph Nodes and their connected elements (limited depth = 2)
    const nodes = this.graph.getAllNodes();
    for (const node of nodes) {
      const matchScore = this.calculateSimilarity(lowerQuery, `${node.label} ${node.type}`);
      if (matchScore > 0.2) {
        // Retrieve connections to build context
        const connections = this.graph.getConnections(node.id, 2);
        const connectionsStr = connections.map(c => c.label).join(', ');
        
        results.push({
          score: matchScore * 1.1, // boost graph matches slightly
          source: 'graph',
          nodeId: node.id,
          title: `Grafik Düğümü: ${node.label} (${node.type})`,
          content: connectionsStr ? `İlişkili Kavramlar: ${connectionsStr}` : 'İlişkili kavram bulunamadı.'
        });
      }
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  private calculateSimilarity(query: string, text: string): number {
    const lowerText = text.toLowerCase();
    const queryWords = query.split(/\s+/).filter(w => w.length > 2);
    if (queryWords.length === 0) {
      return lowerText.includes(query) ? 0.5 : 0;
    }

    let matches = 0;
    for (const word of queryWords) {
      if (lowerText.includes(word)) {
        matches++;
      }
    }

    return matches / queryWords.length;
  }
}
