import type { Workflow } from './Workflow';
import { container } from '../container/ServiceContainer';

export class WorkflowExecutor {
  public async execute(workflow: Workflow): Promise<boolean> {
    console.log(`[WorkflowExecutor] Initiating workflow: ${workflow.title} (${workflow.id})`);
    
    // Evaluate conditions first
    if (!this.evaluateConditions(workflow)) {
      console.log(`[WorkflowExecutor] Conditions not met for: ${workflow.title}`);
      return false;
    }

    let success = true;
    for (const action of workflow.actions) {
      try {
        const ok = await this.executeAction(action);
        if (!ok) success = false;
      } catch (err) {
        console.error(`[WorkflowExecutor] Action execution failed:`, err);
        success = false;
      }
    }

    if (success) {
      workflow.executionCount++;
      workflow.lastExecuted = new Date().toISOString();
      
      // Update life scores when workflow runs successfully
      try {
        const lm = container.resolve<any>('LifeModel');
        if (lm) {
          await lm.analyze(true);
        }
      } catch (_) {}
    }

    return success;
  }

  private evaluateConditions(workflow: Workflow): boolean {
    // Standard condition evaluator
    for (const cond of workflow.conditions) {
      if (cond.type === 'goal_progress_less' && cond.config.value !== undefined) {
        try {
          const ge = container.resolve<any>('GoalEngine');
          const goals = ge ? ge.getGoals() : [];
          if (goals.length > 0 && goals[0].progress >= cond.config.value) {
            return false;
          }
        } catch (_) {}
      }
    }
    return true;
  }

  private async executeAction(action: any): Promise<boolean> {
    console.log(`[WorkflowExecutor] Executing action type: ${action.type}`, action.params);
    
    const toolManager = container.resolve<any>('ToolManager');
    
    if (action.type === 'speakMessage' && action.params.message) {
      // Direct speak action (can send speech completion event)
      console.log(`[WorkflowExecutor] SPEAK: ${action.params.message}`);
      return true;
    }

    if (action.type === 'createReminder' && toolManager) {
      await toolManager.executeTool('reminders', {
        action: 'add',
        title: action.params.title,
        time: action.params.time
      });
      return true;
    }

    if (action.type === 'createTask' && toolManager) {
      await toolManager.executeTool('tasks', {
        action: 'add',
        title: action.params.title,
        priority: action.params.priority
      });
      return true;
    }

    if (action.type === 'createCalendarEvent' && toolManager) {
      await toolManager.executeTool('calendar', {
        action: 'add',
        title: action.params.title,
        time: action.params.time
      });
      return true;
    }

    if (action.type === 'runAgent' && action.params.agentId) {
      const am = container.resolve<any>('AgentManager');
      if (am) {
        // Run agent suitabilities
        console.log(`[WorkflowExecutor] Triggering agent run: ${action.params.agentId}`);
      }
      return true;
    }

    return false;
  }
}
