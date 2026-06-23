import type { Goal } from './Goal';

export class GoalTracker {
  public updateProgress(goal: Goal, lifeSnapshot: any): boolean {
    let changed = false;
    const text = goal.title.toLowerCase();

    // Health / Fitness progress updates
    if (goal.category === 'health' || goal.category === 'fitness' || text.includes('kilo')) {
      // Find current weight from memories or snapshot if available
      // Assume a dummy progression or fetch if mock is set
      const currentWeight = lifeSnapshot.weight || 98;
      
      for (const ms of goal.milestones) {
        if (ms.status === 'pending' && ms.targetValue >= currentWeight) {
          ms.status = 'completed';
          ms.completedAt = new Date().toISOString();
          ms.currentValue = currentWeight;
          changed = true;
        }
      }
    } else {
      // Progress based on completed tasks or general steps
      const todayTasks = lifeSnapshot.todayTasksCount || 0;
      if (todayTasks === 0 && goal.progress < 100) {
        // Mock progress update if tasks are being cleared
        for (const ms of goal.milestones) {
          if (ms.status === 'pending') {
            ms.status = 'completed';
            ms.completedAt = new Date().toISOString();
            changed = true;
            break;
          }
        }
      }
    }

    // Compute progress %
    const completedCount = goal.milestones.filter(m => m.status === 'completed').length;
    const newProgress = goal.milestones.length > 0 
      ? Math.round((completedCount / goal.milestones.length) * 100) 
      : 0;

    if (newProgress !== goal.progress) {
      goal.progress = newProgress;
      goal.updatedAt = new Date().toISOString();
      if (newProgress === 100) {
        goal.status = 'completed';
        goal.completedAt = new Date().toISOString();
      }
      changed = true;
    }

    return changed;
  }
}
