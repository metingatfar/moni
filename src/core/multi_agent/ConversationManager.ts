export interface DiscussionEntry {
  discussionId: string;
  agentName: string;
  type: 'question' | 'answer' | 'recommendation' | 'agreement' | 'disagreement';
  content: string;
  timestamp: number;
}

export class ConversationManager {
  private discussions: Map<string, DiscussionEntry[]> = new Map();

  public createDiscussion(discussionId: string): void {
    if (!this.discussions.has(discussionId)) {
      this.discussions.set(discussionId, []);
    }
  }

  public addEntry(
    discussionId: string,
    agentName: string,
    type: DiscussionEntry['type'],
    content: string
  ): DiscussionEntry {
    this.createDiscussion(discussionId);
    const entry: DiscussionEntry = {
      discussionId,
      agentName,
      type,
      content,
      timestamp: Date.now()
    };
    this.discussions.get(discussionId)!.push(entry);
    return entry;
  }

  public getDiscussion(discussionId: string): DiscussionEntry[] {
    return this.discussions.get(discussionId) || [];
  }

  public getAllDiscussions(): Map<string, DiscussionEntry[]> {
    return this.discussions;
  }

  public clear(): void {
    this.discussions.clear();
  }
}
