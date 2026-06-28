export interface InteractionConnection {
  sourceScreenId: string;
  targetScreenId: string;
  triggerEvent: 'click' | 'hover' | 'swipe' | 'voice';
  transitionEffect: 'fade' | 'slide-left' | 'slide-right' | 'pop';
  durationMs: number;
}

export class PrototypeEngine {
  private connections: InteractionConnection[] = [];

  public connect(connection: InteractionConnection): void {
    this.connections.push(connection);
  }

  public getConnections(): InteractionConnection[] {
    return this.connections;
  }

  public getTransitionsForScreen(screenId: string): InteractionConnection[] {
    return this.connections.filter(c => c.sourceScreenId === screenId);
  }

  public clear(): void {
    this.connections = [];
  }
}
