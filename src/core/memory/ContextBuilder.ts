import type { ChatMessage } from '../ai/LLMProvider';
import type { MemoryItem } from '../../domain/entities/MemoryItem';
import { eventBus } from '../events/EventBus';
import { container } from '../container/ServiceContainer';

export class ContextBuilder {
  /**
   * Compiles context block to append to the system prompt or user prompt.
   */
  public static buildPromptContext(
    historySummary: string,
    matchingFacts: MemoryItem[],
    recentMessages: ChatMessage[]
  ): string {
    let contextBlock = '';

    if (historySummary) {
      contextBlock += `[Önceki Konuşmaların Özeti]\n${historySummary}\n\n`;
    }

    if (matchingFacts.length > 0) {
      contextBlock += `[Hatırlanan Kalıcı Bilgiler]\n`;
      matchingFacts.forEach(fact => {
        contextBlock += `- [Kategori: ${fact.category}] ${fact.content}\n`;
        
        // Record usage in DB/memory engine and trigger event
        try {
          eventBus.publish('MemoryUsed', fact);
          const longTermMemory = container.resolve<any>('LongTermMemory');
          if (longTermMemory && typeof longTermMemory.recordUsage === 'function') {
            longTermMemory.recordUsage(fact);
          }
        } catch (e) {
          // Silent fallback in test environments or before bootstrap
        }
      });
      contextBlock += `\n`;
    }

    if (recentMessages.length > 0) {
      contextBlock += `[Yakın Konuşma Geçmişi]\n`;
      recentMessages.forEach(m => {
        contextBlock += `${m.role.toUpperCase()}: ${m.content}\n`;
      });
    }

    return contextBlock;
  }
}
