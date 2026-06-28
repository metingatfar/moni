import type { KnowledgeDocument } from './KnowledgeDocument';

export interface IndexedReport {
  fileName: string;
  title: string;
  category: string;
  sprint: number;
  keywords: string[];
}

export class ReportIndexer {
  private reports: IndexedReport[] = [
    { fileName: 'AI_Orchestrator_Report.md', title: 'AI Orchestrator Report', category: 'orchestrator', sprint: 6, keywords: ['orchestration', 'provider', 'prompt'] },
    { fileName: 'Apply_Preparation_Report.md', title: 'Apply Preparation Report', category: 'preparation', sprint: 5, keywords: ['apply', 'manifest', 'sandbox'] },
    { fileName: 'LLM_Execution_Report.md', title: 'LLM Execution Report', category: 'llm', sprint: 7, keywords: ['execution', 'runtime', 'adapters'] },
    { fileName: 'AI_Consensus_Report.md', title: 'AI Consensus Report', category: 'consensus', sprint: 8, keywords: ['consensus', 'multi-agent', 'reasoning'] },
    { fileName: 'Diagnostics_Report.md', title: 'Diagnostics Report', category: 'diagnostics', sprint: 9, keywords: ['diagnostics', 'errors', 'status'] },
    { fileName: 'Performance_Report.md', title: 'Performance Report', category: 'performance', sprint: 9, keywords: ['performance', 'latency', 'speed'] },
    { fileName: 'Technical_Debt_Report.md', title: 'Technical Debt Report', category: 'debt', sprint: 9, keywords: ['debt', 'refactoring', 'warnings'] },
    { fileName: 'Production_Readiness_Report.md', title: 'Production Readiness Report', category: 'readiness', sprint: 9, keywords: ['readiness', 'compilation', 'production'] }
  ];

  public getReports(): IndexedReport[] {
    return this.reports;
  }

  public getDocuments(): KnowledgeDocument[] {
    return this.reports.map((rep, idx) => ({
      id: `REPORT-${(idx + 1).toString().padStart(4, '0')}`,
      title: rep.title,
      category: 'report' as const,
      content: `Report File: reports/${rep.fileName}\nTitle: ${rep.title}\nCategory: ${rep.category}\nKeywords: ${rep.keywords.join(', ')}`,
      sprint: rep.sprint,
      metadata: rep,
      timestamp: new Date().toISOString()
    }));
  }
}

export const reportIndexer = new ReportIndexer();
export default reportIndexer;
