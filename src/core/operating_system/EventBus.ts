export class EventBus {
  private listeners: Map<string, Array<(payload: any) => void>> = new Map();

  public subscribe(event: string, callback: (payload: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    return () => this.unsubscribe(event, callback);
  }

  public unsubscribe(event: string, callback: (payload: any) => void): void {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event)!;
    const index = list.indexOf(callback);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  public publish(event: string, payload: any): void {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event)!;
    // Execute listener callbacks safely
    for (const callback of [...list]) {
      try {
        callback(payload);
      } catch (e) {
        console.error(`[EventBus] Error in listener for ${event}:`, e);
      }
    }
  }

  public broadcast(payload: any): void {
    this.publish('*', payload);
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const eventBusOS = new EventBus();
export default eventBusOS;
