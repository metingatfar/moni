import { container } from '../container/ServiceContainer';

export interface DecisionRecord {
  decisionId: string;
  discussionId: string;
  category: string;
  decision: string;
  justification: string;
  confidence: number;
  timestamp: number;
}

export class AgentMemory {
  private decisions: DecisionRecord[] = [];
  private lessonsLearned: string[] = [];

  public recordDecision(
    discussionId: string,
    category: string,
    decision: string,
    justification: string,
    confidence: number
  ): DecisionRecord {
    const decisionId = `dec-coll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const record: DecisionRecord = {
      decisionId,
      discussionId,
      category,
      decision,
      justification,
      confidence,
      timestamp: Date.now()
    };
    this.decisions.push(record);

    // Synchronize with MONIBrain if available in the service container
    try {
      const brain = container.resolve<any>('MONIBrain');
      if (brain && brain.getDecisions) {
        const decisionsMemory = brain.getDecisions();
        if (decisionsMemory && decisionsMemory.recordDecision) {
          decisionsMemory.recordDecision(category, decision, justification, confidence);
        }
      }
    } catch (e) {
      console.warn('AgentMemory could not sync with MONIBrain:', e);
    }

    return record;
  }

  public recordLesson(lesson: string): void {
    this.lessonsLearned.push(lesson);
  }

  public getDecisions(): DecisionRecord[] {
    return this.decisions;
  }

  public getLessons(): string[] {
    return this.lessonsLearned;
  }

  public clear(): void {
    this.decisions = [];
    this.lessonsLearned = [];
  }
}
