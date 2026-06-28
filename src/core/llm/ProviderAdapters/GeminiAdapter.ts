import type { LLMProvider, LLMRequest, RawLLMResponse } from '../LLMProvider';

export class GeminiAdapter implements LLMProvider {
  public name = 'Google';

  public async executeRequest(req: LLMRequest): Promise<RawLLMResponse> {
    console.log(`[GeminiAdapter] Executing mock request. User prompt length: ${req.userPrompt.length}`);
    return {
      content: JSON.stringify({
        status: 'success',
        explanation: 'Gemini mock code response suggestion',
        code: '// Gemini generated mock patch proposal\nexport function test() {}'
      }),
      usage: {
        promptTokens: Math.ceil(req.userPrompt.length * 0.25),
        completionTokens: 200
      },
      providerName: 'Google',
      modelName: 'gemini-1.5-pro'
    };
  }
}
