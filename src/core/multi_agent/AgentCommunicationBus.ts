export interface AgentMessage {
  messageId: string;
  sender: string;
  receiver?: string; // Empty for broadcast
  topic: string;
  content: string;
  timestamp: number;
}

export class AgentCommunicationBus {
  private messages: AgentMessage[] = [];
  private listeners: Map<string, Array<(msg: AgentMessage) => void>> = new Map();

  public sendDirect(sender: string, receiver: string, topic: string, content: string): AgentMessage {
    const msg: AgentMessage = {
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender,
      receiver,
      topic,
      content,
      timestamp: Date.now()
    };
    this.messages.push(msg);
    this.triggerListeners(receiver, msg);
    this.triggerListeners('*', msg);
    return msg;
  }

  public broadcast(sender: string, topic: string, content: string): AgentMessage {
    const msg: AgentMessage = {
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender,
      topic,
      content,
      timestamp: Date.now()
    };
    this.messages.push(msg);
    this.triggerListeners('*', msg);
    return msg;
  }

  public subscribe(agentName: string, callback: (msg: AgentMessage) => void): void {
    if (!this.listeners.has(agentName)) {
      this.listeners.set(agentName, []);
    }
    this.listeners.get(agentName)!.push(callback);
  }

  public getHistory(): AgentMessage[] {
    return this.messages;
  }

  public clear(): void {
    this.messages = [];
    this.listeners.clear();
  }

  private triggerListeners(key: string, msg: AgentMessage): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(msg);
        } catch (e) {
          console.error(`Error in communication bus listener for ${key}:`, e);
        }
      });
    }
  }
}
