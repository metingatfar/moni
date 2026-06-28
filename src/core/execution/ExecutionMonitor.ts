export interface RunningTask {
  taskId: string;
  name: string;
  progressPercent: number;
  status: 'running' | 'completed' | 'failed';
  startedAt: number;
  updatedAt: number;
  resourceUsage: { cpuPercent: number; memoryMb: number };
}

export class ExecutionMonitor {
  private tasks: Map<string, RunningTask> = new Map();

  public trackTask(taskId: string, name: string): void {
    const task: RunningTask = {
      taskId,
      name,
      progressPercent: 0,
      status: 'running',
      startedAt: Date.now(),
      updatedAt: Date.now(),
      resourceUsage: { cpuPercent: 12, memoryMb: 128 }
    };
    this.tasks.set(taskId, task);
  }

  public updateProgress(taskId: string, progress: number): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.progressPercent = Math.min(100, Math.max(0, progress));
      task.updatedAt = Date.now();
      if (progress >= 100) {
        task.status = 'completed';
      }
    }
  }

  public recordFailure(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'failed';
      task.updatedAt = Date.now();
      console.warn(`[ExecutionMonitor] Task ${taskId} failed: ${error}`);
    }
  }

  public getRunningTasks(): RunningTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'running');
  }

  public getAllTasks(): RunningTask[] {
    return Array.from(this.tasks.values());
  }

  public getTaskStats() {
    const all = Array.from(this.tasks.values());
    const completed = all.filter(t => t.status === 'completed').length;
    const failed = all.filter(t => t.status === 'failed').length;
    const running = all.filter(t => t.status === 'running').length;

    return {
      total: all.length,
      completed,
      failed,
      running
    };
  }
}
