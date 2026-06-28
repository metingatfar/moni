export interface MoniProjectMeta {
  name: string;
  goals: string[];
  domain: string;
  techStack: string[];
  confidence: number;
  openTasks: string[];
  completedTasks: string[];
  risks: string[];
}

export class ProjectMemory {
  private project: MoniProjectMeta = {
    name: 'Moni Enterprise App',
    goals: ['Unified developer workspace', 'Proactive context synthesis', 'Zero production mutations'],
    domain: 'Software Engineering AI Platform',
    techStack: ['TypeScript', 'Next.js', 'PostgreSQL', 'Vercel', 'Gemini 3.5'],
    confidence: 98,
    openTasks: ['Initialize Brain Center UI Drawer', 'Validate Persistent Memory searches'],
    completedTasks: ['Resolve ExperienceEngine container bootstrap', 'Render floating assistant widget'],
    risks: ['Context window overflow if workspace grows too large']
  };

  public getProject(): MoniProjectMeta {
    return this.project;
  }

  public updateProject(updates: Partial<MoniProjectMeta>): void {
    this.project = { ...this.project, ...updates };
  }

  public addTask(task: string, status: 'open' | 'completed'): void {
    if (status === 'open') {
      if (!this.project.openTasks.includes(task)) {
        this.project.openTasks.push(task);
      }
    } else {
      if (!this.project.completedTasks.includes(task)) {
        this.project.completedTasks.push(task);
      }
    }
  }

  public completeTask(task: string): void {
    this.project.openTasks = this.project.openTasks.filter(t => t !== task);
    if (!this.project.completedTasks.includes(task)) {
      this.project.completedTasks.push(task);
    }
  }
}

export const projectMemory = new ProjectMemory();
export default projectMemory;
