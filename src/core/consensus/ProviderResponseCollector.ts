import { container } from '../container/ServiceContainer';
import type { UnifiedAIResponse } from '../llm/ResponseNormalizer';

export class ProviderResponseCollector {
  public async collectResponses(
    providers: string[],
    systemPrompt: string,
    userPrompt: string
  ): Promise<Map<string, UnifiedAIResponse>> {
    const results = new Map<string, UnifiedAIResponse>();
    const llmEngine = container.resolve<any>('LLMExecutionEngine');
    
    if (!llmEngine) {
      throw new Error('LLMExecutionEngine not registered in ServiceContainer.');
    }

    const promises = providers.map(async (provider) => {
      try {
        const response = await llmEngine.executePrompt(provider, systemPrompt, userPrompt);
        results.set(provider.toLowerCase(), response);
      } catch (err: any) {
        console.error(`[ProviderResponseCollector] Failed to collect response from ${provider}:`, err.message);
      }
    });

    await Promise.all(promises);
    return results;
  }
}

export const providerResponseCollector = new ProviderResponseCollector();
export default providerResponseCollector;
