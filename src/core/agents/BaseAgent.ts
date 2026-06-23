import type { Agent } from './Agent';
import type { AgentContext } from './AgentContext';
import type { AgentResult } from './AgentResult';

export abstract class BaseAgent implements Agent {
  public abstract id: string;
  public abstract name: string;
  public abstract description: string;
  public abstract capabilities: string[];

  protected executionCount = 0;
  protected failureCount = 0;

  public abstract canHandle(input: string, context: AgentContext): Promise<boolean>;
  public abstract execute(input: string, context: AgentContext): Promise<AgentResult>;

  public getDiagnostics() {
    return {
      id: this.id,
      name: this.name,
      executionCount: this.executionCount,
      failureCount: this.failureCount
    };
  }

  protected safeResponse(message: string, confidence: number, success = true): AgentResult {
    this.executionCount++;
    return {
      success,
      message: this.formatTtsFriendlyMessage(message),
      actions: [],
      events: [],
      confidence,
      requiresConfirmation: false,
      suggestedNextSteps: [],
      toolCalls: []
    };
  }

  protected needsConfirmation(message: string, confidence: number, toolCalls: any[]): AgentResult {
    this.executionCount++;
    return {
      success: true,
      message: this.formatTtsFriendlyMessage(message),
      actions: [],
      events: [],
      confidence,
      requiresConfirmation: true,
      suggestedNextSteps: [],
      toolCalls
    };
  }

  protected formatTtsFriendlyMessage(text: string): string {
    // Strips markdown, asterisks, or other special symbols to make it voice-friendly
    return text.replace(/[*#`_\-]/g, '').trim();
  }
}
