// PromptExecutionHistory — tracks all LLM prompt executions

export interface HistoryItem {
  id: string;
  provider: string;
  model: string;
  promptHash: string;
  latencyMs: number;
  totalTokens: number;
  costEstimate: number;
  timestamp: string;
}

export class PromptExecutionHistory {
  private history: HistoryItem[] = [];

  public logExecution(
    provider: string,
    model: string,
    prompt: string,
    latencyMs: number,
    totalTokens: number,
    costEstimate: number
  ): void {
    const promptHash = this.hashPrompt(prompt);
    this.history.push({
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      provider,
      model,
      promptHash,
      latencyMs,
      totalTokens,
      costEstimate,
      timestamp: new Date().toISOString()
    });
  }

  private hashPrompt(prompt: string): string {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  public getHistory(): HistoryItem[] {
    return this.history;
  }
}

export const promptExecutionHistory = new PromptExecutionHistory();
export default promptExecutionHistory;
