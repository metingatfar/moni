import { PriorityEngine } from './PriorityEngine';
import type { ScoredTodo } from './PriorityEngine';
import { RecommendationEngine } from './RecommendationEngine';
import { DailyBriefEngine } from './DailyBriefEngine';
import type { Todo } from '../domain/entities/Todo';
import type { Reminder } from '../domain/entities/Reminder';
import type { MemoryItem } from '../domain/entities/MemoryItem';

export interface ExecutiveStatus {
  dailyBrief: string;
  recommendations: string[];
  scoredTodos: ScoredTodo[];
  activeProjects: string[];
  topPriorityTask: Todo | null;
}

export class DecisionEngine {
  /**
   * Orchestrates the brain engines to produce a complete executive summary.
   */
  public static async analyzeExecutiveStatus(
    todos: Todo[],
    reminders: Reminder[],
    memories: MemoryItem[],
    apiKey?: string
  ): Promise<ExecutiveStatus> {
    // 1. Extract active project names from memory categories
    const activeProjects = memories
      .filter(m => (m.category as string) === 'projects' || (m.category as string) === 'work')
      .map(m => m.content.trim());

    // 2. Score and prioritize todos using the PriorityEngine
    const scoredTodos = PriorityEngine.scoreTodos(todos, activeProjects);

    // 3. Generate proactive daily recommendations
    const recommendations = RecommendationEngine.generateRecommendations(scoredTodos, reminders);

    // 4. Generate the personalized briefing text (Gemini or offline fallback)
    const dailyBrief = await DailyBriefEngine.generateDailyBrief(
      memories,
      scoredTodos,
      reminders,
      apiKey
    );

    // 5. Identify the top priority task (highest score task that is incomplete)
    const topPriorityTask = scoredTodos.find(t => !t.isCompleted) || null;

    return {
      dailyBrief,
      recommendations,
      scoredTodos,
      activeProjects,
      topPriorityTask
    };
  }
}
