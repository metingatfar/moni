import type { KnowledgeDocument } from './KnowledgeDocument';

export interface TechDebtItem {
  id: string;
  title: string;
  category: 'debt' | 'issue' | 'improvement' | 'refactor';
  description: string;
  estimatedRemediationTimeMs: number;
  severity: 'low' | 'medium' | 'high';
}

export class TechnicalDebtMemory {
  private items: TechDebtItem[] = [
    {
      id: 'DEBT-0001',
      title: 'Vite build module codeSplitting optimization',
      category: 'refactor',
      description: 'Some modules are larger than 500kB. Need to enable dynamic import dynamic code splitting to optimize bundle chunks.',
      estimatedRemediationTimeMs: 1800000, // 30 mins
      severity: 'low'
    },
    {
      id: 'DEBT-0002',
      title: 'Pre-build environment variable validation checks',
      category: 'improvement',
      description: 'Add more validation checks in prebuild.js to check local capacitor properties and release key stores.',
      estimatedRemediationTimeMs: 3600000, // 1 hour
      severity: 'medium'
    },
    {
      id: 'DEBT-0003',
      title: 'In-memory telemetry caching limit',
      category: 'debt',
      description: 'Telemetry logs in memory grow without a cap. Need to limit max size to 1000 items and dump older items to backup.',
      estimatedRemediationTimeMs: 7200000, // 2 hours
      severity: 'medium'
    }
  ];

  public getItems(): TechDebtItem[] {
    return this.items;
  }

  public getDocuments(): KnowledgeDocument[] {
    return this.items.map(item => ({
      id: item.id,
      title: item.title,
      category: 'debt' as const,
      content: `Tech Debt: ${item.title} (${item.category})\nDescription: ${item.description}\nSeverity: ${item.severity}\nTime: ${item.estimatedRemediationTimeMs / 60000} mins`,
      sprint: 9,
      metadata: item,
      timestamp: new Date().toISOString()
    }));
  }
}

export const technicalDebtMemory = new TechnicalDebtMemory();
export default technicalDebtMemory;
