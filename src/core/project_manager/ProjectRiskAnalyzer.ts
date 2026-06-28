import type { PlannedTask } from './TaskDecomposer';
import type { TaskEdge } from './TaskDependencyGraph';

export interface RiskAnalysis {
  architectureRisk: number; // 0-100
  dependencyRisk: number; // 0-100
  regressionRisk: number; // 0-100
  timelineRisk: number; // 0-100
  deliveryConfidence: number; // 0-100
  overallRisk: 'low' | 'medium' | 'high';
}

export class ProjectRiskAnalyzer {
  public analyzeRisk(tasks: PlannedTask[], edges: TaskEdge[]): RiskAnalysis {
    const totalTasks = tasks.length;
    const totalEdges = edges.length;

    const architectureRisk = tasks.some(t => t.category === 'database') ? 45 : 20;
    const dependencyRisk = totalEdges > 3 ? 50 : 25;
    const regressionRisk = tasks.some(t => t.category === 'security') ? 60 : 30;
    const timelineRisk = totalTasks > 6 ? 55 : 30;

    const avgRisk = (architectureRisk + dependencyRisk + regressionRisk + timelineRisk) / 4;
    const deliveryConfidence = Math.round(100 - avgRisk);
    
    let overallRisk: 'low' | 'medium' | 'high' = 'medium';
    if (avgRisk > 60) {
      overallRisk = 'high';
    } else if (avgRisk < 35) {
      overallRisk = 'low';
    }

    return {
      architectureRisk,
      dependencyRisk,
      regressionRisk,
      timelineRisk,
      deliveryConfidence,
      overallRisk
    };
  }
}

export const projectRiskAnalyzer = new ProjectRiskAnalyzer();
export default projectRiskAnalyzer;
