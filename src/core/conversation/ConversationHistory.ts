import type { ChatMessage } from '../ai/LLMProvider';

export class ConversationHistory {
  private messages: ChatMessage[] = [];
  private limit = 20;

  public addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    this.messages.push({
      role,
      content,
      timestamp: new Date()
    });
    if (this.messages.length > this.limit) {
      this.messages.shift();
    }
  }

  public getMessages(): ChatMessage[] {
    return this.messages;
  }

  public getLength(): number {
    return this.messages.length;
  }

  public clear(): void {
    this.messages = [];
  }

  /**
   * Formats history for LLM prompt context or summarizing
   */
  public format(): string {
    return this.messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');
  }
}
