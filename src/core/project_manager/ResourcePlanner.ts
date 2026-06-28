import type { PlannedTask } from './TaskDecomposer';

export class ResourcePlanner {
  public assignAIResource(task: PlannedTask): string {
    switch (task.category) {
      case 'ui':
        return 'GPT (OpenAI)';
      case 'architecture':
        return 'Claude (Anthropic)';
      case 'database':
        return 'Gemini (Google)';
      case 'api':
        return 'DeepSeek';
      case 'testing':
      default:
        return 'Ollama (Local LLM)';
    }
  }

  public planResources(tasks: PlannedTask[]): Map<string, string> {
    const assignments = new Map<string, string>();
    for (const task of tasks) {
      assignments.set(task.id, this.assignAIResource(task));
    }
    return assignments;
  }
}

export const resourcePlanner = new ResourcePlanner();
export default resourcePlanner;
