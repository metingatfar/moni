import type { LLMProvider, LLMRequest, RawLLMResponse } from '../LLMProvider';

export class DeepSeekAdapter implements LLMProvider {
  public name = 'DeepSeek';

  public async executeRequest(req: LLMRequest): Promise<RawLLMResponse> {
    console.log(`[DeepSeekAdapter] Executing mock request. User prompt length: ${req.userPrompt.length}`);
    return {
      content: JSON.stringify({
        status: 'success',
        explanation: 'DeepSeek mock code response suggestion',
        code: '// DeepSeek generated mock patch proposal\nexport function test() {}'
      }),
      usage: {
        promptTokens: Math.ceil(req.userPrompt.length * 0.25),
        completionTokens: 280
      },
      providerName: 'DeepSeek',
      modelName: 'deepseek-coder'
    };
  }
}
