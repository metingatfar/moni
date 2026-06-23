import type { ChatMessage } from '../ai/LLMProvider';

export class ShortTermMemory {
  private buffer: ChatMessage[] = [];
  private limit: number = 20;

  public addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    this.buffer.push({ role, content, timestamp: new Date() });
    if (this.buffer.length > this.limit) {
      this.buffer.shift();
    }
  }

  public getMessages(): ChatMessage[] {
    return this.buffer;
  }

  public clear(): void {
    this.buffer = [];
  }
}
