export interface ProjectNode {
  projectName: string;
  architectureVersion: string;
  components: string[];
}

export class ProjectKnowledge {
  private projects: Map<string, ProjectNode> = new Map();

  constructor() {
    this.initDefaultProjects();
  }

  private initDefaultProjects() {
    const moniProj = 'MONI AI Operating System';
    const fitProj = 'FitHayat';

    this.projects.set('moni', {
      projectName: moniProj,
      architectureVersion: 'Sprint 3.4',
      components: ['ExecutiveBrain', 'ReasoningEngine', 'PlanningEngine', 'ToolIntelligenceEngine', 'CognitiveKnowledgeEngine', 'VisionIntelligenceEngine']
    });

    this.projects.set('fithayat', {
      projectName: fitProj,
      architectureVersion: 'v1.0.0',
      components: ['UI Module', 'Workout Tracker', 'Nutrition Tracker', 'Veritabanı Katmanı']
    });
  }

  public getProject(name: string): ProjectNode | undefined {
    const key = name.toLowerCase().trim();
    if (key.includes('moni')) return this.projects.get('moni');
    if (key.includes('fithayat')) return this.projects.get('fithayat');
    return this.projects.get(key);
  }

  public getAllProjects(): ProjectNode[] {
    return Array.from(this.projects.values());
  }

  public registerProject(name: string, architectureVersion: string, components: string[]): void {
    this.projects.set(name.toLowerCase().trim(), {
      projectName: name,
      architectureVersion,
      components
    });
  }
}
