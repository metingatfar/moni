import { llmRuntime } from './LLMRuntime';
import { responseValidator } from './ResponseValidator';
import { responseNormalizer } from './ResponseNormalizer';
import type { UnifiedAIResponse } from './ResponseNormalizer';
import { promptExecutionHistory } from './PromptExecutionHistory';
import { executionMetrics } from './ExecutionMetrics';
import type { LLMRequest } from './LLMProvider';

export class LLMExecutionEngine {
  public async executePrompt(
    providerName: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<UnifiedAIResponse> {
    const startTime = Date.now();
    const req: LLMRequest = { systemPrompt, userPrompt };

    // Set provider mapping name (Google/Gemini, etc.)
    let resolvedProvider = providerName;
    if (providerName.toLowerCase() === 'gemini') resolvedProvider = 'google';
    if (providerName.toLowerCase() === 'gpt') resolvedProvider = 'openai';

    try {
      const rawRes = await llmRuntime.executeSession(resolvedProvider, req);
      const latencyMs = Date.now() - startTime;

      // Validate
      const validation = responseValidator.validateResponse(rawRes);
      if (!validation.valid) {
        executionMetrics.recordFailure(resolvedProvider, latencyMs);
        throw new Error(`LLM Response Validation Failed: ${validation.errors.join(', ')}`);
      }

      // Normalize
      const normalized = responseNormalizer.normalize(rawRes);
      
      // Log History & Metrics
      const totalTokens = normalized.promptTokens + normalized.completionTokens;
      // Mock cost
      const costEstimate = (normalized.promptTokens / 1000000) * 2.5 + (normalized.completionTokens / 1000000) * 10.0;
      
      promptExecutionHistory.logExecution(
        normalized.provider,
        normalized.modelName,
        userPrompt,
        latencyMs,
        totalTokens,
        costEstimate
      );

      executionMetrics.recordSuccess(
        normalized.provider,
        latencyMs,
        totalTokens,
        costEstimate
      );

      return normalized;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      executionMetrics.recordFailure(resolvedProvider, latencyMs);
      throw err;
    }
  }
}

export const llmExecutionEngine = new LLMExecutionEngine();
export default llmExecutionEngine;
