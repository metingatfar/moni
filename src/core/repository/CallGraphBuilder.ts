export interface CallNode {
  caller: string;
  callees: string[];
}

export class CallGraphBuilder {
  private callGraph: CallNode[] = [
    {
      caller: 'ExecutiveBrain.execute',
      callees: [
        'AutonomousExecutiveEngine.evaluateExecution',
        'ReasoningEngine.reason',
        'PlanningEngine.shouldPlan',
        'ToolManager.executeTool'
      ]
    },
    {
      caller: 'AutonomousExecutiveEngine.evaluateExecution',
      callees: []
    },
    {
      caller: 'ReasoningEngine.reason',
      callees: []
    }
  ];

  public buildCallGraph(): CallNode[] {
    return [...this.callGraph];
  }

  public getCallees(caller: string): string[] {
    const node = this.callGraph.find(n => n.caller === caller);
    return node ? node.callees : [];
  }

  public getCallGraphSize(): number {
    return this.callGraph.length;
  }
}

export const callGraphBuilder = new CallGraphBuilder();
export default callGraphBuilder;
