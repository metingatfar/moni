import type { LLMProvider, RawLLMResponse, LLMRequest } from './LLMProvider';
import { OpenAIAdapter } from './ProviderAdapters/OpenAIAdapter';
import { AnthropicAdapter } from './ProviderAdapters/AnthropicAdapter';
import { GeminiAdapter } from './ProviderAdapters/GeminiAdapter';
import { OllamaAdapter } from './ProviderAdapters/OllamaAdapter';
import { DeepSeekAdapter } from './ProviderAdapters/DeepSeekAdapter';

export class LLMRuntime {
  private providers: Map<string, LLMProvider> = new Map();

  constructor() {
    this.registerProvider('openai', new OpenAIAdapter());
    this.registerProvider('anthropic', new AnthropicAdapter());
    this.registerProvider('google', new GeminiAdapter());
    this.registerProvider('ollama', new OllamaAdapter());
    this.registerProvider('deepseek', new DeepSeekAdapter());
  }

  public registerProvider(name: string, provider: LLMProvider): void {
    this.providers.set(name.toLowerCase(), provider);
  }

  public async executeSession(
    providerName: string,
    req: LLMRequest,
    timeoutMs = 15000
  ): Promise<RawLLMResponse> {
    const prov = this.providers.get(providerName.toLowerCase());
    if (!prov) {
      throw new Error(`AI Provider ${providerName} is not supported or registered in LLMRuntime.`);
    }

    console.log(`[LLMRuntime] Starting execution session on ${providerName} (Timeout: ${timeoutMs}ms)`);

    // Implement a simple execution session with mock timeout
    return new Promise<RawLLMResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`LLM Execution Session timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      prov.executeRequest(req)
        .then(res => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const llmRuntime = new LLMRuntime();
export default llmRuntime;
