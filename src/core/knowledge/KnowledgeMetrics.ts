export interface KnowledgeMetricsSummary {
  indexedDocuments: number;
  indexedReports: number;
  indexedSprints: number;
  indexedModules: number;
  indexedADRs: number;
  indexedDebt: number;
  graphNodes: number;
  graphEdges: number;
  healthScore: number; // 0-100 percentage
  memoryUsageBytes: number;
}

export class KnowledgeMetrics {
  private documentCount = 0;
  private reportCount = 0;
  private sprintCount = 0;
  private moduleCount = 0;
  private adrCount = 0;
  private debtCount = 0;
  private nodeCount = 0;
  private edgeCount = 0;

  public setMetrics(stats: Partial<KnowledgeMetricsSummary>): void {
    if (stats.indexedDocuments !== undefined) this.documentCount = stats.indexedDocuments;
    if (stats.indexedReports !== undefined) this.reportCount = stats.indexedReports;
    if (stats.indexedSprints !== undefined) this.sprintCount = stats.indexedSprints;
    if (stats.indexedModules !== undefined) this.moduleCount = stats.indexedModules;
    if (stats.indexedADRs !== undefined) this.adrCount = stats.indexedADRs;
    if (stats.indexedDebt !== undefined) this.debtCount = stats.indexedDebt;
    if (stats.graphNodes !== undefined) this.nodeCount = stats.graphNodes;
    if (stats.graphEdges !== undefined) this.edgeCount = stats.graphEdges;
  }

  public getSummary(): KnowledgeMetricsSummary {
    return {
      indexedDocuments: this.documentCount,
      indexedReports: this.reportCount,
      indexedSprints: this.sprintCount,
      indexedModules: this.moduleCount,
      indexedADRs: this.adrCount,
      indexedDebt: this.debtCount,
      graphNodes: this.nodeCount,
      graphEdges: this.edgeCount,
      healthScore: 100, // Perfect score
      memoryUsageBytes: this.documentCount * 1240 // mock estimate
    };
  }
}

export const knowledgeMetrics = new KnowledgeMetrics();
export default knowledgeMetrics;
