export interface ExecutiveState {
  activeRequest: string;
  activePlan: string;
  activeGoal: string;
  runningWorkflow: string;
  activeTool: string;
  activeAgents: string[];
  currentSprint: string;
  currentContext: string;
  cpuEstimate: 'Low' | 'Medium' | 'High';
  tokenBudget: number;
  userActivity: 'Active' | 'Idle' | 'Away';
}

export class ExecutiveStateManager {
  private state: ExecutiveState = {
    activeRequest: 'None',
    activePlan: 'None',
    activeGoal: 'None',
    runningWorkflow: 'None',
    activeTool: 'None',
    activeAgents: [],
    currentSprint: 'Sprint 3.6',
    currentContext: 'General Chat',
    cpuEstimate: 'Low',
    tokenBudget: 100000,
    userActivity: 'Active'
  };

  public getState(): ExecutiveState {
    return { ...this.state };
  }

  public updateState(updates: Partial<ExecutiveState>): void {
    this.state = { ...this.state, ...updates };
  }
}
