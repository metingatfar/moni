import type { LLMProvider, LLMRequest, RawLLMResponse } from '../LLMProvider';

export class OpenAIAdapter implements LLMProvider {
  public name = 'OpenAI';

  public async executeRequest(req: LLMRequest): Promise<RawLLMResponse> {
    console.log(`[OpenAIAdapter] Executing mock request. User prompt length: ${req.userPrompt.length}`);
    return {
      content: JSON.stringify({
        status: 'success',
        explanation: 'OpenAI mock code response suggestion',
        code: '// OpenAI generated mock patch proposal\nexport function test() {}'
      }),
      usage: {
        promptTokens: Math.ceil(req.userPrompt.length * 0.25),
        completionTokens: 250
      },
      providerName: 'OpenAI',
      modelName: 'gpt-4o'
    };
  }
}
