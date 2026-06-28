import type { Milestone } from './MilestonePlanner';
import type { TaskEdge } from './TaskDependencyGraph';

export interface ExecutionRoadmapData {
  milestones: Milestone[];
  taskOrder: string[]; // Ordered list of Task IDs
  dependencies: TaskEdge[];
  totalEstimatedHours: number;
  criticalRisks: string[];
  requiredApprovals: string[];
}

export class ExecutionRoadmap {
  public compileRoadmap(
    milestones: Milestone[],
    criticalPath: string[],
    dependencies: TaskEdge[],
    totalHours: number
  ): ExecutionRoadmapData {
    return {
      milestones,
      taskOrder: criticalPath,
      dependencies,
      totalEstimatedHours: totalHours,
      criticalRisks: [
        'Prerequisite database migrations delay downstream API implementation.',
        'OAuth credential configuration errors block frontend route protection validation.'
      ],
      requiredApprovals: [
        'Architect approval on Database Schema Design.',
        'SecOps validation on Access Middleware Integration.'
      ]
    };
  }
}

export const executionRoadmap = new ExecutionRoadmap();
export default executionRoadmap;
