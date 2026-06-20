import { DecisionEngine } from './DecisionEngine';
import type { ExecutiveStatus } from './DecisionEngine';
import type { Todo } from '../domain/entities/Todo';
import type { Reminder } from '../domain/entities/Reminder';
import type { MemoryItem } from '../domain/entities/MemoryItem';

export class BrainService {
  /**
   * Fetches the complete executive summary status of tasks, agenda, and memory contexts.
   */
  public static async getExecutiveStatus(
    todos: Todo[],
    reminders: Reminder[],
    memories: MemoryItem[],
    apiKey?: string
  ): Promise<ExecutiveStatus> {
    return DecisionEngine.analyzeExecutiveStatus(todos, reminders, memories, apiKey);
  }
}
export const brainService = BrainService;
