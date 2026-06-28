export interface TimelineEvent {
  eventId: string;
  sessionName: string;
  stepName: string;
  description: string;
  timestamp: number;
}

export class CollaborationTimeline {
  private events: TimelineEvent[] = [];

  public recordStep(sessionName: string, stepName: string, description: string): TimelineEvent {
    const event: TimelineEvent = {
      eventId: `evt-time-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionName,
      stepName,
      description,
      timestamp: Date.now()
    };
    this.events.push(event);
    return event;
  }

  public getEvents(sessionName?: string): TimelineEvent[] {
    if (sessionName) {
      return this.events.filter(e => e.sessionName === sessionName);
    }
    return this.events;
  }

  public clear(): void {
    this.events = [];
  }
}
