import type { PlannedTask } from './TaskDecomposer';

export interface Milestone {
  name: string;
  phase: string;
  tasksContained: string[]; // Task IDs
  deliverable: string;
  completionCriteria: string;
}

export class MilestonePlanner {
  public planMilestones(tasks: PlannedTask[]): Milestone[] {
    const milestones: Milestone[] = [];
    const taskIds = tasks.map(t => t.id);

    if (taskIds.length >= 2) {
      milestones.push({
        name: 'Milestone 1 — Core Foundation & Services',
        phase: 'Phase 1: Architecture & Backend API',
        tasksContained: taskIds.slice(0, 2),
        deliverable: 'Database schemas and running API backend services.',
        completionCriteria: 'Schemas validated, endpoints responding with correct mocks.'
      });
    }

    if (taskIds.length >= 4) {
      milestones.push({
        name: 'Milestone 2 — Frontend Integration & Security',
        phase: 'Phase 2: UI & Access Control',
        tasksContained: taskIds.slice(2, 4),
        deliverable: 'React user interfaces integrated with auth middleware.',
        completionCriteria: 'UI forms rendering, route protection active.'
      });
    }

    if (taskIds.length >= 5) {
      milestones.push({
        name: 'Milestone 3 — Verification & Delivery',
        phase: 'Phase 3: Testing & Handover',
        tasksContained: taskIds.slice(4),
        deliverable: 'Complete automated test coverage suite.',
        completionCriteria: 'All unit and integration checks passing without regression.'
      });
    }

    return milestones;
  }
}

export const milestonePlanner = new MilestonePlanner();
export default milestonePlanner;
