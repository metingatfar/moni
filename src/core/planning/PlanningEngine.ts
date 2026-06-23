import { ProjectPlanner } from './ProjectPlanner';
import { TaskDecomposer } from './TaskDecomposer';
import { DependencyGraph } from './DependencyGraph';
import { ExecutionPlanner } from './ExecutionPlanner';
import type { ProjectRoadmap } from './ExecutionPlanner';
import { ProgressTracker } from './ProgressTracker';
import type { StepState } from './ProgressTracker';
import { recoveryPlanner } from './RecoveryPlanner';
import { eventBus } from '../events/EventBus';

export class PlanningEngine {
  private projectPlanner = new ProjectPlanner();
  private taskDecomposer = new TaskDecomposer();
  private depGraph = new DependencyGraph();
  private execPlanner = new ExecutionPlanner();
  private tracker = new ProgressTracker();

  // Selection statistics
  private activePlansCount = 0;
  private completedPlansCount = 0;
  private planningTimes: number[] = [];

  /**
   * Determine if the input contains a complex objective requiring PlanningEngine.
   */
  public shouldPlan(input: string): boolean {
    const lower = input.toLowerCase().trim();
    // Keywords triggering a structured project or roadmap planning
    const triggers = ['geliştirme planı', 'geliştirme projesi', 'proje planı', 'plan hazırla', 'yol haritası', 'organize et', 'tasarla'];
    return triggers.some(t => lower.includes(t));
  }

  public createPlan(input: string): ProjectRoadmap {
    const start = Date.now();

    // 1. Decompose Project into Modules
    const project = this.projectPlanner.decomposeProject(input);

    // 2. Build task titles and register node keys
    const taskTitles: Record<string, string> = {};
    const taskIds: string[] = [];
    this.depGraph.clear();

    for (const mod of project.modules) {
      const mainTaskId = mod.id;
      taskIds.push(mainTaskId);
      taskTitles[mainTaskId] = `${mod.name} (${mod.description})`;
      this.depGraph.addNode(mainTaskId);

      // 3. Decompose tasks into atomic subtasks
      const decomposed = this.taskDecomposer.decomposeTask(mainTaskId, mod.name);
      for (const sub of decomposed.subtasks) {
        const subId = sub.id;
        taskIds.push(subId);
        taskTitles[subId] = `  ↳ ${sub.title}`;
        this.depGraph.addNode(subId);
        // Subtask depends on main module initiation
        this.depGraph.addDependency(subId, mainTaskId);
      }
    }

    // Connect modules to build dependencies (e.g. Activity tracking depends on Auth initiation)
    if (project.modules.length > 1) {
      for (let i = 1; i < project.modules.length; i++) {
        this.depGraph.addDependency(project.modules[i].id, project.modules[i - 1].id);
      }
    }

    // 4. Generate topological roadmap steps
    const orderedIds = this.depGraph.getTopologicalOrder();
    const dependencies: Record<string, string[]> = {};
    for (const id of orderedIds) {
      dependencies[id] = this.depGraph.getDependencies(id);
    }

    const roadmap = this.execPlanner.generateRoadmap(project.id, orderedIds, taskTitles, dependencies);

    // 5. Track state progress
    this.tracker.clear();
    this.tracker.initializeSteps(orderedIds);
    this.activePlansCount++;

    const selectionTime = Date.now() - start;
    this.planningTimes.push(selectionTime);

    eventBus.publish('ToolIntelligencePlanned', {
      input,
      stepsCount: orderedIds.length,
      requiresConfirmation: true,
      selectionTime
    });

    return roadmap;
  }

  public updateStepProgress(stepId: string, state: StepState): void {
    this.tracker.updateStepState(stepId, state);
    if (this.tracker.calculateCompletionPercentage() === 100) {
      this.completedPlansCount++;
      this.activePlansCount = Math.max(0, this.activePlansCount - 1);
    }
  }

  public triggerRecovery(failedStepId: string, roadmap: ProjectRoadmap): ProjectRoadmap {
    const updatedSteps = recoveryPlanner.generateRecoveryPlan(failedStepId, roadmap.steps);
    return {
      projectId: roadmap.projectId,
      steps: updatedSteps
    };
  }

  public getDiagnostics() {
    const avgPlanningTime = this.planningTimes.length > 0
      ? Math.round(this.planningTimes.reduce((a, b) => a + b, 0) / this.planningTimes.length)
      : 8;

    const completionRate = this.tracker.calculateCompletionPercentage();

    return {
      activePlans: this.activePlansCount,
      completedPlans: this.completedPlansCount,
      blockedPlans: this.tracker.getBlockedStepsCount(),
      avgPlanningTimeMs: avgPlanningTime,
      recoveryPlansCount: recoveryPlanner.getRecoveryPlansCount(),
      dependencyGraphSize: this.depGraph.getSize(),
      executionReadinessPercent: 100 - this.tracker.getBlockedStepsCount() * 10,
      planningAccuracyPercent: completionRate > 0 ? completionRate : 95
    };
  }
}
export const planningEngine = new PlanningEngine();
export default planningEngine;
