export interface HistoryMilestone {
  sprint: string;
  module: string;
  milestone: string;
  date: string;
  confidence: number;
}

export class EngineeringHistory {
  private milestones: HistoryMilestone[] = [
    {
      sprint: 'Sprint 5.4',
      module: 'Technology Architect',
      milestone: 'Technology stack and framework selector planning engine established',
      date: '2026-06-20',
      confidence: 94
    },
    {
      sprint: 'Sprint 5.5',
      module: 'Universal Code Generator',
      milestone: 'Syntax layout templates and multi-language resolvers constructed',
      date: '2026-06-22',
      confidence: 95
    },
    {
      sprint: 'Sprint 5.6',
      module: 'Experience Platform',
      milestone: 'Midnight/Graphite CSS themes and workspace isolation implemented',
      date: '2026-06-24',
      confidence: 96
    },
    {
      sprint: 'Sprint 5.7',
      module: 'MONI Brain & Persistent Memory',
      milestone: 'Active context manager and architectural graph links mapped',
      date: '2026-06-25',
      confidence: 98
    }
  ];

  public getMilestones(): HistoryMilestone[] {
    return this.milestones;
  }

  public recordMilestone(sprint: string, module: string, milestone: string, date: string, confidence: number): void {
    this.milestones.push({ sprint, module, milestone, date, confidence });
  }
}

export const engineeringHistory = new EngineeringHistory();
export default engineeringHistory;
