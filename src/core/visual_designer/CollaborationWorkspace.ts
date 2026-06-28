export interface DesignComment {
  id: string;
  author: string;
  screenId: string;
  text: string;
  resolved: boolean;
  timestamp: string;
}

export class CollaborationWorkspace {
  private comments: DesignComment[] = [];

  public addComment(comment: Omit<DesignComment, 'id' | 'resolved' | 'timestamp'>): DesignComment {
    const newComment: DesignComment = {
      ...comment,
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      resolved: false,
      timestamp: new Date().toISOString()
    };
    this.comments.push(newComment);
    return newComment;
  }

  public getComments(): DesignComment[] {
    return this.comments;
  }

  public resolveComment(id: string): void {
    const comment = this.comments.find(c => c.id === id);
    if (comment) {
      comment.resolved = true;
    }
  }

  public clear(): void {
    this.comments = [];
  }
}
