import type { ChatMessage } from '../ai/LLMProvider';

export class ConversationSummary {
  private summary: string = '';

  public getSummary(): string {
    return this.summary;
  }

  public updateSummary(newSummary: string): void {
    this.summary = newSummary;
  }

  /**
   * Generates a structural text representation of history to send to LLM for summarizing.
   */
  public formatForSummary(messages: ChatMessage[]): string {
    return messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  }
}
