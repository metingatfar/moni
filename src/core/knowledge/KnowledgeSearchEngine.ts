import type { KnowledgeDocument } from './KnowledgeDocument';

export interface ModuleHistoryEntry {
  moduleName: string;
  createdInSprint: string;
  modifiedInSprint: string[];
  lastUpdated: string;
  lastReferenced: string;
}

export class KnowledgeSearchEngine {
  private documents: KnowledgeDocument[] = [];
  
  // Decoupled Module History store
  private moduleHistories: Record<string, ModuleHistoryEntry> = {
    'RepositoryScanner': {
      moduleName: 'RepositoryScanner',
      createdInSprint: 'Sprint 4.1-A',
      modifiedInSprint: ['Sprint 4.1-B', 'Sprint 4.3-B'],
      lastUpdated: '2026-06-24',
      lastReferenced: '2026-06-24'
    },
    'CodeIntelligenceEngine': {
      moduleName: 'CodeIntelligenceEngine',
      createdInSprint: 'Sprint 4.1-B',
      modifiedInSprint: ['Sprint 4.2-A', 'Sprint 4.3-C'],
      lastUpdated: '2026-06-24',
      lastReferenced: '2026-06-24'
    },
    'DeveloperAgent': {
      moduleName: 'DeveloperAgent',
      createdInSprint: 'Sprint 4.2-A',
      modifiedInSprint: ['Sprint 4.2-B', 'Sprint 4.3-A'],
      lastUpdated: '2026-06-23',
      lastReferenced: '2026-06-24'
    },
    'AIConsensusEngine': {
      moduleName: 'AIConsensusEngine',
      createdInSprint: 'Sprint 4.3-C',
      modifiedInSprint: [],
      lastUpdated: '2026-06-24',
      lastReferenced: '2026-06-24'
    },
    'KnowledgeBaseEngine': {
      moduleName: 'KnowledgeBaseEngine',
      createdInSprint: 'Sprint 4.3-D',
      modifiedInSprint: [],
      lastUpdated: '2026-06-24',
      lastReferenced: '2026-06-24'
    }
  };

  public setDocuments(docs: KnowledgeDocument[]): void {
    this.documents = docs;
  }

  public search(query: string): KnowledgeDocument[] {
    const term = query.toLowerCase();
    return this.documents.filter(doc => 
      doc.title.toLowerCase().includes(term) ||
      doc.content.toLowerCase().includes(term) ||
      (doc.metadata && JSON.stringify(doc.metadata).toLowerCase().includes(term))
    );
  }

  public getModuleHistory(moduleName: string): ModuleHistoryEntry | null {
    return this.moduleHistories[moduleName] ?? null;
  }

  public getAllModuleHistories(): ModuleHistoryEntry[] {
    return Object.values(this.moduleHistories);
  }
}

export const knowledgeSearchEngine = new KnowledgeSearchEngine();
export default knowledgeSearchEngine;
