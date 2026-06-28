import { sprintHistoryIndexer } from './SprintHistoryIndexer';
import { architectureDecisionMemory } from './ArchitectureDecisionMemory';
import { technicalDebtMemory } from './TechnicalDebtMemory';
import { reportIndexer } from './ReportIndexer';
import { knowledgeSearchEngine } from './KnowledgeSearchEngine';
import { engineeringKnowledgeGraph } from './EngineeringKnowledgeGraph';
import { knowledgeMetrics } from './KnowledgeMetrics';
import type { KnowledgeDocument } from './KnowledgeDocument';

export class KnowledgeBaseEngine {
  private isLoaded = false;
  private documents: KnowledgeDocument[] = [];

  public initialize(): void {
    if (this.isLoaded) return;
    
    console.log('[KnowledgeBaseEngine] Initiating knowledge index compilation pipeline...');

    // 1. Gather all documents from child indexers
    const sprintDocs = sprintHistoryIndexer.getDocuments();
    const adrDocs = architectureDecisionMemory.getDocuments();
    const debtDocs = technicalDebtMemory.getDocuments();
    const reportDocs = reportIndexer.getDocuments();
    const vocabDocs = engineeringKnowledgeGraph.getDocuments();

    this.documents = [
      ...sprintDocs,
      ...adrDocs,
      ...debtDocs,
      ...reportDocs,
      ...vocabDocs
    ];

    // 2. Load search engine
    knowledgeSearchEngine.setDocuments(this.documents);

    // 3. Collect statistics and compile metrics
    const graphData = engineeringKnowledgeGraph.getGraph();
    const uniqueModules = new Set<string>();
    sprintHistoryIndexer.getTimeline().forEach(s => s.modulesIntroduced.forEach(m => uniqueModules.add(m)));

    knowledgeMetrics.setMetrics({
      indexedDocuments: this.documents.length,
      indexedReports: reportDocs.length,
      indexedSprints: sprintDocs.length,
      indexedModules: uniqueModules.size,
      indexedADRs: adrDocs.length,
      indexedDebt: debtDocs.length,
      graphNodes: graphData.nodes.length,
      graphEdges: graphData.edges.length
    });

    this.isLoaded = true;
    console.log(`[KnowledgeBaseEngine] Pipeline complete. Compiled ${this.documents.length} knowledge items into search index.`);
  }

  public getDocuments(): KnowledgeDocument[] {
    this.initialize();
    return this.documents;
  }

  public querySearch(query: string): KnowledgeDocument[] {
    this.initialize();
    return knowledgeSearchEngine.search(query);
  }
}

export const knowledgeBaseEngine = new KnowledgeBaseEngine();
export default knowledgeBaseEngine;
