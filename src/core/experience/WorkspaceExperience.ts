export type MoniWorkspaceType =
  | 'home'
  | 'studio'
  | 'engineering'
  | 'visual_builder'
  | 'executive'
  | 'chat'
  | 'presentation';

export class WorkspaceExperience {
  private activeWorkspace: MoniWorkspaceType = 'home';
  private workspaceHistory: MoniWorkspaceType[] = ['home'];

  public switchWorkspace(target: MoniWorkspaceType): void {
    this.activeWorkspace = target;
    this.workspaceHistory.push(target);
  }

  public getActiveWorkspace(): MoniWorkspaceType {
    return this.activeWorkspace;
  }

  public getHistory(): MoniWorkspaceType[] {
    return this.workspaceHistory;
  }
}
export const workspaceExperience = new WorkspaceExperience();
export default workspaceExperience;
