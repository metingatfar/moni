import type { LLMProvider, LLMRequest, RawLLMResponse } from '../LLMProvider';

export class OllamaAdapter implements LLMProvider {
  public name = 'Ollama';

  public async executeRequest(req: LLMRequest): Promise<RawLLMResponse> {
    console.log(`[OllamaAdapter] Executing mock request. User prompt length: ${req.userPrompt.length}`);
    return {
      content: JSON.stringify({
        status: 'success',
        explanation: 'Ollama local mock code response suggestion',
        code: '// Ollama generated local mock patch proposal\nexport function test() {}'
      }),
      usage: {
        promptTokens: Math.ceil(req.userPrompt.length * 0.25),
        completionTokens: 180
      },
      providerName: 'Ollama',
      modelName: 'llama-3-8b'
    };
  }
}
