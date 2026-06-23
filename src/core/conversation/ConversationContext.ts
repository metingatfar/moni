import type { ConversationTopic } from './ConversationTopic';

export interface PendingSlots {
  type?: 'meeting' | 'task' | 'reminder';
  title?: string;
  time?: string;
  participants?: string[];
  location?: string;
  priority?: string;
}

export class ConversationContext {
  public currentTopic: ConversationTopic = 'chat';
  public lastTopicChange: string = new Date().toISOString();
  public currentIntent: 'create_meeting' | 'create_task' | 'create_reminder' | 'chat' = 'chat';
  public pendingSlots: PendingSlots = {};
  public askedSlots: string[] = [];
  public lastSummary: string = 'Henüz özet oluşturulmadı.';
  public lastCommandTime: number = Date.now();
  public contextSize: number = 0;

  public resetMultiTurn(): void {
    this.currentIntent = 'chat';
    this.pendingSlots = {};
    this.askedSlots = [];
  }

  public isMultiTurnActive(): boolean {
    return this.currentIntent !== 'chat';
  }

  public setTopic(topic: ConversationTopic): void {
    if (this.currentTopic !== topic) {
      this.currentTopic = topic;
      this.lastTopicChange = new Date().toISOString();
      console.log(`[ConversationContext] Topic changed to: ${topic}`);
    }
  }
}
