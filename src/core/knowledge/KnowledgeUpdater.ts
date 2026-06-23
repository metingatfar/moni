import { KnowledgeGraph } from './KnowledgeGraph';
import type { GraphNode } from './KnowledgeGraph';
import { PersonalKnowledge } from './PersonalKnowledge';
import { WorldKnowledge } from './WorldKnowledge';
import { ProjectKnowledge } from './ProjectKnowledge';
import { FactVerifier } from './FactVerifier';

export interface UpdateResult {
  success: boolean;
  action: 'added_node' | 'added_edge' | 'updated_fact' | 'ignored_duplicate' | 'conflict_detected';
  conflictDetails?: string;
  confidenceScore: number;
}

export class KnowledgeUpdater {
  private verifier = new FactVerifier();
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
   * Safe node insertion to prevent duplication
   */
  public addNodeSafely(node: GraphNode): UpdateResult {
    const existing = this.graph.getNode(node.id);
    if (existing) {
      if (existing.label === node.label && existing.type === node.type) {
        return {
          success: true,
          action: 'ignored_duplicate',
          confidenceScore: 1.0
        };
      }
      // Conflict
      return {
        success: false,
        action: 'conflict_detected',
        conflictDetails: `Düğüm ID '${node.id}' mevcut ancak farklı özelliklere sahip. Mevcut: [${existing.label}, ${existing.type}], Yeni: [${node.label}, ${node.type}]`,
        confidenceScore: 0.5
      };
    }

    this.graph.addNode(node);
    return {
      success: true,
      action: 'added_node',
      confidenceScore: 1.0
    };
  }

  /**
   * Safe edge insertion to prevent duplication
   */
  public addEdgeSafely(from: string, to: string, relation: string): UpdateResult {
    const existingEdges = this.graph.getAllEdges();
    const exists = existingEdges.some(
      e => e.from === from && e.to === to && e.relation === relation
    );

    if (exists) {
      return {
        success: true,
        action: 'ignored_duplicate',
        confidenceScore: 1.0
      };
    }

    this.graph.addEdge(from, to, relation);
    return {
      success: true,
      action: 'added_edge',
      confidenceScore: 1.0
    };
  }

  /**
   * Updates personal or world knowledge while checking verification and avoiding duplicates/conflicts
   */
  public updateFactSafely(
    topicOrKey: string,
    valueOrDesc: string,
    source: 'user' | 'memory' | 'internet' | 'system',
    category: 'sport' | 'software' | 'health' | 'nutrition' | 'general' | 'identity'
  ): UpdateResult {
    const verification = this.verifier.verifyFact(valueOrDesc, source);

    if (!verification.isVerified) {
      return {
        success: false,
        action: 'conflict_detected',
        conflictDetails: `Doğrulama başarısız: ${verification.notes}`,
        confidenceScore: verification.confidenceScore
      };
    }

    if (verification.requiresUserConfirmation) {
      return {
        success: false,
        action: 'conflict_detected',
        conflictDetails: `Kullanıcı onayı gerekiyor (Kaynak: ${source}): ${verification.notes}`,
        confidenceScore: verification.confidenceScore
      };
    }

    if (category === 'identity') {
      const existing = this.personal.getFact(topicOrKey);
      if (existing && existing.value === valueOrDesc) {
        return {
          success: true,
          action: 'ignored_duplicate',
          confidenceScore: verification.confidenceScore
        };
      }
      this.personal.learnFact(topicOrKey, valueOrDesc);
    } else if (category === 'general' && topicOrKey.startsWith('proj_')) {
      const projName = topicOrKey.substring(5);
      this.project.registerProject(projName, 'v1.0.0', [valueOrDesc]);
    } else {
      const existing = this.world.getTopicInfo(topicOrKey);
      if (existing && existing.description === valueOrDesc) {
        return {
          success: true,
          action: 'ignored_duplicate',
          confidenceScore: verification.confidenceScore
        };
      }
      this.world.learnWorldFact(topicOrKey, category as any, valueOrDesc, verification.confidenceScore);
    }

    return {
      success: true,
      action: 'updated_fact',
      confidenceScore: verification.confidenceScore
    };
  }
}
