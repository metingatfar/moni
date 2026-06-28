export interface GraphNode {
  id: string;
  type: 'Module' | 'Screen' | 'Component' | 'API' | 'Table' | 'Service' | 'Report' | 'Test' | 'Dependency';
  label: string;
}

export interface GraphEdge {
  fromId: string;
  toId: string;
  relationship: string;
}

export class KnowledgeGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  constructor() {
    // Populate default nodes
    this.addNode('node-editor-screen', 'Screen', 'Monaco Code Editor Screen');
    this.addNode('node-sidebar-comp', 'Component', 'Navigation Sidebar');
    this.addNode('node-pg-table', 'Table', 'Users Schema Migration PostgreSQL');
    this.addNode('node-tts-service', 'Service', 'Text-To-Speech ElevenLabs Service');
    this.addNode('node-api-gen', 'API', 'Project Templates API Generator REST');
    this.addNode('node-test-suite', 'Test', 'Experience Platform Smoke Test Unit');

    // Populate default edges
    this.addEdge('node-editor-screen', 'node-sidebar-comp', 'contains');
    this.addEdge('node-api-gen', 'node-pg-table', 'writes_to');
    this.addEdge('node-tts-service', 'node-editor-screen', 'speaks_in');
  }

  public getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getEdges(): GraphEdge[] {
    return this.edges;
  }

  public addNode(id: string, type: GraphNode['type'], label: string): void {
    this.nodes.set(id, { id, type, label });
  }

  public addEdge(fromId: string, toId: string, relationship: string): void {
    if (this.nodes.has(fromId) && this.nodes.has(toId)) {
      this.edges.push({ fromId, toId, relationship });
    }
  }

  public getConnectedNodes(nodeId: string): GraphNode[] {
    const connectedIds = new Set<string>();
    for (const edge of this.edges) {
      if (edge.fromId === nodeId) connectedIds.add(edge.toId);
      if (edge.toId === nodeId) connectedIds.add(edge.fromId);
    }
    const result: GraphNode[] = [];
    for (const id of connectedIds) {
      const node = this.nodes.get(id);
      if (node) result.push(node);
    }
    return result;
  }
}

export const knowledgeGraph = new KnowledgeGraph();
export default knowledgeGraph;
