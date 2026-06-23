import type { ChatMessage } from './LLMProvider';

export class ConversationManager {
  private history: ChatMessage[] = [];
  private maxHistoryLength: number = 30;

  constructor(initialHistory?: ChatMessage[]) {
    if (initialHistory) {
      this.history = [...initialHistory];
    }
  }

  public getHistory(): ChatMessage[] {
    return this.history;
  }

  public addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    this.history.push({
      role,
      content,
      timestamp: new Date()
    });

    if (this.history.length > this.maxHistoryLength) {
      // Retain the system prompt/first instruction if it was index 0
      const systemPrompt = this.history[0]?.role === 'system' ? this.history[0] : null;
      this.history = this.history.slice(-this.maxHistoryLength);
      if (systemPrompt && !this.history.includes(systemPrompt)) {
        this.history.unshift(systemPrompt);
      }
    }
  }

  public clearHistory(): void {
    this.history = [];
  }

  public getFormattedForApi(): { role: string; content: string }[] {
    return this.history.map(m => ({
      role: m.role,
      content: m.content
    }));
  }
}
