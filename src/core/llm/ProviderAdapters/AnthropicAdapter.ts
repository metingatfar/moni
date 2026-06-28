import type { LLMProvider, LLMRequest, RawLLMResponse } from '../LLMProvider';

export class AnthropicAdapter implements LLMProvider {
  public name = 'Anthropic';

  public async executeRequest(req: LLMRequest): Promise<RawLLMResponse> {
    console.log(`[AnthropicAdapter] Executing mock request. User prompt length: ${req.userPrompt.length}`);
    return {
      content: JSON.stringify({
        status: 'success',
        explanation: 'Anthropic mock code response suggestion',
        code: '// Anthropic generated mock patch proposal\nexport function test() {}'
      }),
      usage: {
        promptTokens: Math.ceil(req.userPrompt.length * 0.25),
        completionTokens: 300
      },
      providerName: 'Anthropic',
      modelName: 'claude-3-5-sonnet'
    };
  }
}
