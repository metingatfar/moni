export interface WorkflowStep {
  id: string;
  engineName: string;
  actionName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
}

export interface WorkflowPlan {
  requestId: string;
  steps: WorkflowStep[];
  status: 'planned' | 'executing' | 'completed' | 'failed';
}

export class WorkflowPlanner {
  public createPlan(requestId: string, userRequest: string): WorkflowPlan {
    const steps: WorkflowStep[] = [];
    const requestLower = userRequest.toLowerCase();

    // Standard sequence following clean architectural dependency flow
    steps.push({ id: `${requestId}-brain`, engineName: 'MONIBrain', actionName: 'constructContext', status: 'pending' });
    steps.push({ id: `${requestId}-architect`, engineName: 'TechnologyArchitect', actionName: 'recommendTechnologyStack', status: 'pending' });
    steps.push({ id: `${requestId}-codegen`, engineName: 'UniversalCodeGenerationEngine', actionName: 'generateProjectPackage', status: 'pending' });
    steps.push({ id: `${requestId}-builder`, engineName: 'VisualBuilderEngine', actionName: 'designScreen', status: 'pending' });
    steps.push({ id: `${requestId}-coding`, engineName: 'AutonomousCodingEngine', actionName: 'generateCode', status: 'pending' });
    steps.push({ id: `${requestId}-testing`, engineName: 'AutonomousTestingEngine', actionName: 'runTests', status: 'pending' });
    steps.push({ id: `${requestId}-healing`, engineName: 'SelfHealingAgent', actionName: 'reconcileFailures', status: 'pending' });
    steps.push({ id: `${requestId}-metrics`, engineName: 'ExperienceEngine', actionName: 'compileMetrics', status: 'pending' });
    steps.push({ id: `${requestId}-resource`, engineName: 'ResourceManager', actionName: 'optimizeBudget', status: 'pending' });

    // Handle skip triggers if specified in the user request
    if (requestLower.includes('skip architect')) {
      const idx = steps.findIndex(s => s.engineName === 'TechnologyArchitect');
      if (idx !== -1) steps[idx].status = 'skipped';
    }
    if (requestLower.includes('skip tests')) {
      const idx = steps.findIndex(s => s.engineName === 'AutonomousTestingEngine');
      if (idx !== -1) steps[idx].status = 'skipped';
    }

    return {
      requestId,
      steps,
      status: 'planned'
    };
  }
}

export const workflowPlannerOS = new WorkflowPlanner();
export default workflowPlannerOS;
