import { container } from '../container/ServiceContainer';
import type { WorkflowPlan } from './WorkflowPlanner';

export class WorkflowExecutor {
  async execute(plan: WorkflowPlan): Promise<boolean> {
    console.log(`[WorkflowExecutor] Executing Workflow ${plan.id} (${plan.name}) in Dry-Run Mode.`);
    
    let executionEngine: any = null;
    let sandboxEngine: any = null;
    try {
      executionEngine = container.resolve<any>('ExecutionEngine');
    } catch (_) {}
    try {
      sandboxEngine = container.resolve<any>('SandboxEngine');
    } catch (_) {}

    for (const step of plan.steps) {
      console.log(`[WorkflowExecutor] -> Step: ${step.stepId} (${step.type}): ${step.action}`);
      if (step.type === 'approval') {
        console.log(`[WorkflowExecutor] -> Waiting for Human Approval (Virtual Mock)`);
      }
      
      // Sandbox / Execution integration
      if (executionEngine) {
        try {
          console.log(`[WorkflowExecutor] Routing task step "${step.action}" through ExecutionEngine sandbox.`);
          await executionEngine.executeCommand(step.action, { sandboxId: 'workflow-sandbox' });
        } catch (e: any) {
          console.error(`[WorkflowExecutor] ExecutionEngine call failed: ${e.message}`);
        }
      } else if (sandboxEngine) {
        try {
          console.log(`[WorkflowExecutor] Routing task step "${step.action}" through SandboxEngine.`);
          sandboxEngine.createSandbox('workflow-sandbox');
          await sandboxEngine.executeInSandbox('workflow-sandbox', step.action);
        } catch (e: any) {
          console.error(`[WorkflowExecutor] SandboxEngine call failed: ${e.message}`);
        }
      }

      // Mock execution delay
      await new Promise(res => setTimeout(res, 50));
    }
    
    return true;
  }
}
