import type { Todo } from '../domain/entities/Todo';

export interface ScoredTodo extends Todo {
  score: number;
}

export class PriorityEngine {
  /**
   * Scores all todos based on priority, due date, delays, and project relevance.
   * Completed tasks are automatically scored as 0.
   */
  public static scoreTodos(todos: Todo[], activeProjects: string[] = []): ScoredTodo[] {
    const now = new Date();

    return todos.map(todo => {
      // Completed tasks have no priority urgency
      if (todo.isCompleted) {
        return { ...todo, score: 0 };
      }

      let score = 0;

      // 1. Base score by user-defined priority level
      switch (todo.priority) {
        case 'high':
          score += 50; // Critical tasks get a high base score
          break;
        case 'medium':
          score += 30; // Medium tasks get moderate base
          break;
        case 'low':
        default:
          score += 10; // Low tasks start low
          break;
      }

      // 2. Score by due date proximity
      const dueDate = new Date(todo.dateTime);
      const isTodayVal = this.isSameDay(dueDate, now);
      const isOverdue = dueDate.getTime() < now.getTime() && !isTodayVal;
      const isTomorrowVal = this.isSameDay(dueDate, new Date(now.getTime() + 24 * 60 * 60 * 1000));

      if (isOverdue) {
        score += 60; // Past due tasks are highly urgent
        
        // Add additional penalty points based on how long it has been delayed
        const hoursOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60));
        // Add 1 point per hour, capped at 24 points (1 day) to avoid extreme overflow
        score += Math.min(hoursOverdue, 24);
      } else if (isTodayVal) {
        score += 40; // Due today is very urgent
      } else if (isTomorrowVal) {
        score += 20; // Due tomorrow gets a slight boost
      }

      // 3. Project Relevance Boost
      // If the task title mentions any project currently active in user's memory (e.g. "FitHayat"), boost it
      const taskLower = todo.task.toLowerCase();
      const hasProjectMatch = activeProjects.some(project => 
        taskLower.includes(project.toLowerCase())
      );
      if (hasProjectMatch) {
        score += 15; // Relevant to active project focus
      }

      // 4. Time of Day Adjustment
      // If due today and it is currently late in the day (past 16:00), increase urgency slightly
      if (isTodayVal && now.getHours() >= 16) {
        score += 10;
      }

      return {
        ...todo,
        score
      };
    }).sort((a, b) => b.score - a.score); // Return sorted by descending score
  }

  /**
   * Checks if two dates represent the same calendar day.
   */
  private static isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
}
