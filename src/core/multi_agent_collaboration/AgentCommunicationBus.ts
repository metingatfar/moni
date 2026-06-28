import type { AgentMessage, AgentMessageType } from './AgentMessage';

export class AgentCommunicationBus {
  private messages: AgentMessage[] = [];

  public sendMessage(
    fromAgent: string,
    toAgent: string,
    messageType: AgentMessageType,
    content: string,
    confidence = 90
  ): AgentMessage {
    const msg: AgentMessage = {
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      fromAgent,
      toAgent,
      messageType,
      content,
      confidence,
      timestamp: new Date().toISOString()
    };
    this.messages.push(msg);
    return msg;
  }

  public broadcast(fromAgent: string, messageType: AgentMessageType, content: string, confidence = 90): AgentMessage {
    return this.sendMessage(fromAgent, 'all', messageType, content, confidence);
  }

  public getMessagesForAgent(agentId: string): AgentMessage[] {
    return this.messages.filter(msg => msg.toAgent === agentId || msg.toAgent === 'all');
  }

  public getMessagesByType(type: AgentMessageType): AgentMessage[] {
    return this.messages.filter(msg => msg.messageType === type);
  }

  public getAllMessages(): AgentMessage[] {
    return this.messages;
  }

  public clear(): void {
    this.messages = [];
  }
}

export const agentCommunicationBus = new AgentCommunicationBus();
export default agentCommunicationBus;
