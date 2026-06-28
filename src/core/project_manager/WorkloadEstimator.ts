import type { PlannedTask } from './TaskDecomposer';

export interface WorkloadEstimate {
  taskId: string;
  hoursEstimated: number;
  complexityScore: number; // 1-10
  developerEffort: 'low' | 'medium' | 'high';
  aiEffort: 'low' | 'medium' | 'high';
  testingEffortHours: number;
}

export class WorkloadEstimator {
  public estimateWorkload(tasks: PlannedTask[]): Map<string, WorkloadEstimate> {
    const estimates = new Map<string, WorkloadEstimate>();

    for (const task of tasks) {
      let hoursEstimated = 4;
      let complexityScore = 5;
      let developerEffort: 'low' | 'medium' | 'high' = 'medium';
      let aiEffort: 'low' | 'medium' | 'high' = 'high';
      let testingEffortHours = 2;

      if (task.category === 'database') {
        hoursEstimated = 6;
        complexityScore = 7;
        developerEffort = 'high';
        testingEffortHours = 3;
      } else if (task.category === 'ui') {
        hoursEstimated = 8;
        complexityScore = 6;
        developerEffort = 'medium';
        aiEffort = 'medium';
        testingEffortHours = 2;
      } else if (task.category === 'testing') {
        hoursEstimated = 3;
        complexityScore = 4;
        developerEffort = 'low';
        testingEffortHours = 1;
      }

      estimates.set(task.id, {
        taskId: task.id,
        hoursEstimated,
        complexityScore,
        developerEffort,
        aiEffort,
        testingEffortHours
      });
    }

    return estimates;
  }
}

export const workloadEstimator = new WorkloadEstimator();
export default workloadEstimator;
