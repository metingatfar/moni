import { KnowledgeGraph } from './KnowledgeGraph';
import { PersonalKnowledge } from './PersonalKnowledge';
import { WorldKnowledge } from './WorldKnowledge';
import { ProjectKnowledge } from './ProjectKnowledge';
import { SemanticSearch } from './SemanticSearch';
import type { SemanticSearchResult } from './SemanticSearch';
import { FactVerifier } from './FactVerifier';
import { KnowledgeUpdater } from './KnowledgeUpdater';
import { KnowledgeRanker } from './KnowledgeRanker';
import { OWNER_PROFILE } from '../../config/ownerProfile';

export interface ExecutiveState {
  ownerName: string;
  ownerId: string;
  privacyMode: string;
  currentSprint: string;
  activeProjects: { name: string; status: string; componentsCount: number }[];
  detectedRisks: { description: string; severity: 'low' | 'medium' | 'high' }[];
  architectureState: { version: string; layers: string[] };
}

export class KnowledgeEngine {
  public graph = new KnowledgeGraph();
  public personal = new PersonalKnowledge();
  public world = new WorldKnowledge();
  public project = new ProjectKnowledge();

  public semanticSearch: SemanticSearch;
  public verifier = new FactVerifier();
  public updater: KnowledgeUpdater;
  public ranker = new KnowledgeRanker();

  private executiveState: ExecutiveState = {
    ownerName: OWNER_PROFILE.ownerName,
    ownerId: OWNER_PROFILE.ownerId,
    privacyMode: OWNER_PROFILE.privacyMode,
    currentSprint: 'Sprint 3.4',
    activeProjects: [
      { name: 'MONI AI Operating System', status: 'active', componentsCount: 6 },
      { name: 'FitHayat', status: 'active', componentsCount: 4 }
    ],
    detectedRisks: [
      { description: 'İnternet verilerinin onaysız kaydedilmesi riski giderildi.', severity: 'low' }
    ],
    architectureState: {
      version: 'Sprint 3.4',
      layers: ['ExecutiveBrain', 'ReasoningEngine', 'PlanningEngine', 'ToolIntelligenceEngine', 'CognitiveKnowledgeEngine', 'VisionIntelligenceEngine', 'ToolManager']
    }
  };

  constructor() {
    this.semanticSearch = new SemanticSearch(this.graph, this.personal, this.world, this.project);
    this.updater = new KnowledgeUpdater(this.graph, this.personal, this.world, this.project);
  }

  /**
   * Get the current executive state tracking sprints, projects, risks, architecture.
   */
  public getExecutiveState(): ExecutiveState {
    return this.executiveState;
  }

  /**
   * Update current executive state details.
   */
  public updateExecutiveState(updates: Partial<ExecutiveState>): void {
    this.executiveState = {
      ...this.executiveState,
      ...updates
    };
  }

  /**
   * Query the Cognitive Knowledge Engine
   */
  public query(query: string): SemanticSearchResult[] {
    return this.semanticSearch.search(query);
  }

  /**
   * Get diagnostic statistics for MONI's Dashboard
   */
  public getDiagnostics() {
    return {
      nodeCount: this.graph.getAllNodes().length,
      edgeCount: this.graph.getAllEdges().length,
      personalFactsCount: this.personal.getAllFacts().length,
      worldFactsCount: this.world.getAllWorldFacts().length,
      projectCount: this.project.getAllProjects().length,
      currentSprint: this.executiveState.currentSprint,
      activeProjectsCount: this.executiveState.activeProjects.length,
      detectedRisksCount: this.executiveState.detectedRisks.length,
      architectureLayersCount: this.executiveState.architectureState.layers.length,
      
      // Owner Identity info for diagnostics panel
      ownerName: this.executiveState.ownerName,
      privacyMode: this.executiveState.privacyMode,
      identitySource: OWNER_PROFILE.identitySource,
      isPermanentOwnerIdentity: OWNER_PROFILE.isPermanentOwnerIdentity
    };
  }
}

export const knowledgeEngine = new KnowledgeEngine();
export default knowledgeEngine;
