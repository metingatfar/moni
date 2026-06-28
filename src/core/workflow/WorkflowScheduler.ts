// ===================================================================
// MONI Sprint 7.0 — WorkflowScheduler.ts
// Manages priority queues, delayed, and recurring workflow schedules.
// ===================================================================

import type { WorkflowPlan } from './WorkflowPlanner';

export class WorkflowScheduler {
  private queue: WorkflowPlan[] = [];

  schedule(plan: WorkflowPlan): void {
    this.queue.push(plan);
    // Sort by priority (mock logic: critical > high > normal > low)
    const pWeight = { critical: 4, high: 3, normal: 2, low: 1 };
    this.queue.sort((a, b) => pWeight[b.priority] - pWeight[a.priority]);
  }

  getNext(): WorkflowPlan | null {
    return this.queue.shift() || null;
  }

  getQueueLength(): number {
    return this.queue.length;
  }
  
  getQueue(): WorkflowPlan[] {
    return [...this.queue];
  }
}
