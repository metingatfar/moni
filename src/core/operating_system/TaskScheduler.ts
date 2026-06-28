export interface Task {
  id: string;
  name: string;
  priority: number;
  dependencies: string[];
  run: () => Promise<any>;
  delayMs?: number;
  retries?: number;
  maxRetries?: number;
}

export class TaskScheduler {
  private queue: Task[] = [];
  private running: boolean = false;
  private currentTasks: Task[] = [];

  public schedule(task: Task): void {
    const maxRetries = task.maxRetries ?? 3;
    this.queue.push({
      ...task,
      retries: task.retries ?? 0,
      maxRetries
    });
    // Re-sort the queue: priority descending, then insertion order stability
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  public getQueue(): Task[] {
    return [...this.queue];
  }

  public getCurrentTasks(): Task[] {
    return [...this.currentTasks];
  }

  public isRunning(): boolean {
    return this.running;
  }

  public async runNext(): Promise<any> {
    if (this.queue.length === 0) return null;
    const task = this.queue.shift()!;
    this.currentTasks.push(task);
    this.running = true;

    try {
      if (task.delayMs && task.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, task.delayMs));
      }
      const result = await task.run();
      this.currentTasks = this.currentTasks.filter((t) => t.id !== task.id);
      return result;
    } catch (e) {
      this.currentTasks = this.currentTasks.filter((t) => t.id !== task.id);
      if (task.retries! < task.maxRetries!) {
        task.retries!++;
        console.warn(`[TaskScheduler] Task ${task.name} failed. Retrying (${task.retries}/${task.maxRetries})...`);
        this.schedule(task);
      } else {
        console.error(`[TaskScheduler] Task ${task.name} failed completely after ${task.maxRetries} retries.`, e);
        throw e;
      }
    } finally {
      this.running = false;
    }
  }

  public async runAll(): Promise<any[]> {
    const results: any[] = [];
    while (this.queue.length > 0) {
      const res = await this.runNext();
      results.push(res);
    }
    return results;
  }

  public clear(): void {
    this.queue = [];
    this.currentTasks = [];
    this.running = false;
  }
}

export const taskSchedulerOS = new TaskScheduler();
export default taskSchedulerOS;
