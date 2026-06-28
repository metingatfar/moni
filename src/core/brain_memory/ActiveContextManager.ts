export interface ActiveContext {
  project: string;
  screen: string;
  module: string;
  sprint: string;
  task: string;
  goal: string;
}

export class ActiveContextManager {
  private activeContext: ActiveContext = {
    project: 'Moni Enterprise App',
    screen: 'Dashboard Screen',
    module: 'MONIBrain',
    sprint: 'Sprint 5.7',
    task: 'Initialize Persistent Context Builder',
    goal: 'Context-aware AI orchestration layer'
  };

  public getActiveContext(): ActiveContext {
    return this.activeContext;
  }

  public updateActiveContext(updates: Partial<ActiveContext>): void {
    this.activeContext = { ...this.activeContext, ...updates };
  }
}

export const activeContextManager = new ActiveContextManager();
export default activeContextManager;
