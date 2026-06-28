export interface TimelineCheckpoint {
  sprint: string;
  date: string;
  modules: string[];
  reports: string[];
  status: 'planning' | 'drafting' | 'completed' | 'active';
  confidence: number;
}

export class SprintTimeline {
  private checkpoints: TimelineCheckpoint[] = [
    {
      sprint: 'Sprint 5.5',
      date: '2026-06-22',
      modules: ['UniversalCodeGenerationEngine', 'FrameworkTemplateRegistry'],
      reports: ['Universal_Code_Generation_Report.md', 'Framework_Template_Report.md'],
      status: 'completed',
      confidence: 94
    },
    {
      sprint: 'Sprint 5.6',
      date: '2026-06-24',
      modules: ['ExperienceEngine', 'ThemeEvolutionEngine', 'NavigationDesigner'],
      reports: ['Experience_Report.md', 'Theme_Report.md', 'Navigation_Report.md'],
      status: 'completed',
      confidence: 96
    },
    {
      sprint: 'Sprint 5.7',
      date: '2026-06-25',
      modules: ['MONIBrain', 'ProjectMemory', 'DecisionMemory', 'ContextBuilder'],
      reports: ['Brain_Report.md', 'Memory_Report.md', 'Decision_Report.md'],
      status: 'active',
      confidence: 98
    }
  ];

  public getCheckpoints(): TimelineCheckpoint[] {
    return this.checkpoints;
  }

  public addCheckpoint(checkpoint: TimelineCheckpoint): void {
    this.checkpoints.push(checkpoint);
  }
}

export const sprintTimeline = new SprintTimeline();
export default sprintTimeline;
