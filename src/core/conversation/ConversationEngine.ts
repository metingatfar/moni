import { ConversationContext } from './ConversationContext';
import { ConversationHistory } from './ConversationHistory';
import { ConversationAnalyzer } from './ConversationAnalyzer';
import { AIOrchestrator } from '../ai/AIOrchestrator';
import { eventBus } from '../events/EventBus';

export class ConversationEngine {
  public context: ConversationContext;
  public history: ConversationHistory;
  public analyzer: ConversationAnalyzer;
  private aiOrchestrator: AIOrchestrator;

  constructor(aiOrchestrator: AIOrchestrator) {
    this.aiOrchestrator = aiOrchestrator;
    this.context = new ConversationContext();
    this.history = new ConversationHistory();
    this.analyzer = new ConversationAnalyzer(aiOrchestrator);

    // Subscribe to pipeline completion to add messages to RAM history
    eventBus.subscribe('PipelineCompleted', (e: any) => {
      if (e.input && e.output) {
        this.history.addMessage('user', e.input);
        this.history.addMessage('assistant', e.output);
        this.context.contextSize = this.history.getLength();
      }
    });
  }

  /**
   * Main entry point to process a message and resolve references/topics
   */
  public async preProcessMessage(userInput: string): Promise<{ resolvedText: string; isClarification: boolean }> {
    // 1. Detect and set active topic
    const topic = this.analyzer.detectTopic(userInput);
    if (topic !== 'chat') {
      this.context.setTopic(topic);
    }

    // 2. Reference Resolution
    const resolved = await this.analyzer.resolveReferences(userInput, this.history.getMessages());
    
    if (resolved.startsWith('CLARIFY:')) {
      const clarificationMsg = resolved.replace('CLARIFY:', '').trim();
      return { resolvedText: clarificationMsg, isClarification: true };
    }

    return { resolvedText: resolved, isClarification: false };
  }

  /**
   * Generates a structural summary of the conversation
   */
  public async generateSummary(): Promise<string> {
    if (this.history.getLength() < 4) {
      return 'Özet oluşturmak için henüz yetersiz konuşma geçmişi var.';
    }

    try {
      const prompt = `Aşağıdaki konuşma geçmişini 1-2 cümleyle Türkçe ve doğal bir dille özetle.
Yalnızca konuşulan önemli kalıcı bilgileri veya kararları vurgula (örneğin planlanan toplantı veya hedefler).
Sohbette kalıcı veya önemli bir bilgi konuşulmadıysa, "Özetlenecek önemli bir bilgi konuşulmadı." yaz.

Geçmiş:
${this.history.format()}

Özet:`;

      const summary = await this.aiOrchestrator.chatComplete({
        message: prompt,
        systemInstruction: "Sen konuşma özetleyen bir asistan robotusun."
      });

      const cleanSummary = summary.trim();
      this.context.lastSummary = cleanSummary;
      console.log(`[ConversationEngine] Conversation summary generated: ${cleanSummary}`);
      return cleanSummary;
    } catch (e) {
      console.error('[ConversationEngine] Summary generation failed:', e);
      return this.context.lastSummary;
    }
  }

  public getDiagnostics() {
    return {
      currentTopic: this.context.currentTopic,
      conversationLength: this.history.getLength(),
      conversationState: this.context.isMultiTurnActive() ? 'Multi-Turn Slot Filling' : 'General Chat',
      currentIntent: this.context.currentIntent,
      lastSummary: this.context.lastSummary,
      lastTopicChange: this.context.lastTopicChange,
      contextSize: this.context.contextSize
    };
  }
}
