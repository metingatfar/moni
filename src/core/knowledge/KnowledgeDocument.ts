export interface KnowledgeDocument {
  id: string; // unique identifier (e.g. ADR-0001, DOC-0001)
  title: string;
  category: 'sprint' | 'report' | 'architecture' | 'decision' | 'debt' | 'vocabulary' | 'notes';
  content: string;
  sprint: number;
  metadata: Record<string, any>;
  timestamp: string;
}
