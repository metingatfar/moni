import type { RawLLMResponse } from './LLMProvider';

export interface UnifiedAIResponse {
  provider: string;
  modelName: string;
  explanation: string;
  codeSuggestion: string;
  promptTokens: number;
  completionTokens: number;
  normalizedAt: string;
}

export class ResponseNormalizer {
  public normalize(response: RawLLMResponse): UnifiedAIResponse {
    let explanation = '';
    let codeSuggestion = '';

    try {
      const parsed = JSON.parse(response.content);
      explanation = parsed.explanation || 'No explanation provided.';
      codeSuggestion = parsed.code || response.content;
    } catch (_) {
      explanation = 'Raw response fallback normalization';
      codeSuggestion = response.content;
    }

    return {
      provider: response.providerName,
      modelName: response.modelName,
      explanation,
      codeSuggestion,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      normalizedAt: new Date().toISOString()
    };
  }
}

export const responseNormalizer = new ResponseNormalizer();
export default responseNormalizer;
