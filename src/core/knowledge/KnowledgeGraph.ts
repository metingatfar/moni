import { OWNER_PROFILE } from '../../config/ownerProfile';

export interface GraphNode {
  id: string;
  label: string;
  type: 'user' | 'project' | 'hobby' | 'task' | 'organization' | 'general';
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

export class KnowledgeGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  constructor() {
    this.initDefaultGraph();
  }

  private initDefaultGraph() {
    // Nodes from OWNER_PROFILE and hardcoded default values
    this.addNode({ id: OWNER_PROFILE.ownerId, label: OWNER_PROFILE.ownerName, type: 'user' });
    this.addNode({ id: 'bolu', label: 'Bolu', type: 'general' });
    this.addNode({ id: 'spor_sube_muduru', label: 'Spor Şube Müdürü', type: 'general' });
    
    // Sports
    const sports = ["Badminton", "Atıcılık"];
    for (const sport of sports) {
      const sportId = sport.toLowerCase().trim();
      this.addNode({ id: sportId, label: sport, type: 'hobby' });
      this.addEdge(OWNER_PROFILE.ownerId, sportId, 'ilgi alanı');
    }

    // Projects
    this.addNode({ id: 'moni', label: 'MONI AI Operating System', type: 'project' });
    this.addNode({ id: 'fithayat', label: 'FitHayat', type: 'project' });

    // Connections
    this.addEdge(OWNER_PROFILE.ownerId, 'bolu', 'çalışıyor');
    this.addEdge(OWNER_PROFILE.ownerId, 'spor_sube_muduru', 'görev');
    this.addEdge(OWNER_PROFILE.ownerId, 'moni', 'geliştiriyor');
    this.addEdge(OWNER_PROFILE.ownerId, 'fithayat', 'geliştiriyor');
  }

  public addNode(node: GraphNode): void {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, node);
    }
  }

  public addEdge(from: string, to: string, relation: string): void {
    // Avoid duplicate edges
    const exists = this.edges.some(e => e.from === from && e.to === to && e.relation === relation);
    if (!exists) {
      this.edges.push({ from, to, relation });
    }
  }

  public getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): GraphEdge[] {
    return this.edges;
  }

  /**
   * Search connected nodes with limited depth to prevent memory overflow in browser.
   */
  public getConnections(nodeId: string, maxDepth = 2): GraphNode[] {
    const connected: Set<string> = new Set();
    const queue: { id: string; depth: number }[] = [{ id: nodeId, depth: 0 }];
    const visited: Set<string> = new Set();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.id) || current.depth > maxDepth) continue;
      visited.add(current.id);

      if (current.id !== nodeId) {
        connected.add(current.id);
      }

      // Find neighbors
      const neighbors = this.edges
        .filter(e => e.from === current.id || e.to === current.id)
        .map(e => (e.from === current.id ? e.to : e.from));

      for (const n of neighbors) {
        if (!visited.has(n)) {
          queue.push({ id: n, depth: current.depth + 1 });
        }
      }
    }

    return Array.from(connected)
      .map(id => this.nodes.get(id)!)
      .filter(Boolean);
  }
}

export const knowledgeGraph = new KnowledgeGraph();
export default knowledgeGraph;
