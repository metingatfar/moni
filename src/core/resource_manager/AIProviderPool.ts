export interface AIProvider {
  id: string;
  name: string;
  endpointUrl: string;
  supportedModels: string[];
  latencyMs: number;
  costPerMillionTokens: number;
  active: boolean;
}

export class AIProviderPool {
  private providers: AIProvider[] = [
    { id: 'claude', name: 'Anthropic Claude', endpointUrl: 'mock://anthropic', supportedModels: ['claude-3-5-sonnet', 'claude-3-opus'], latencyMs: 380, costPerMillionTokens: 15.0, active: true },
    { id: 'gpt', name: 'OpenAI GPT', endpointUrl: 'mock://openai', supportedModels: ['gpt-4o', 'gpt-3.5-turbo'], latencyMs: 250, costPerMillionTokens: 10.0, active: true },
    { id: 'gemini', name: 'Google Gemini', endpointUrl: 'mock://gemini', supportedModels: ['gemini-1.5-pro', 'gemini-1.5-flash'], latencyMs: 180, costPerMillionTokens: 7.0, active: true },
    { id: 'deepseek', name: 'DeepSeek AI', endpointUrl: 'mock://deepseek', supportedModels: ['deepseek-chat', 'deepseek-coder'], latencyMs: 400, costPerMillionTokens: 2.0, active: true },
    { id: 'ollama', name: 'Local Ollama', endpointUrl: 'mock://ollama', supportedModels: ['llama3', 'mistral'], latencyMs: 80, costPerMillionTokens: 0.0, active: true }
  ];

  public getProviders(): AIProvider[] {
    return this.providers;
  }

  public getActiveProviders(): AIProvider[] {
    return this.providers.filter(p => p.active);
  }

  public toggleProvider(id: string, active: boolean): void {
    const provider = this.providers.find(p => p.id === id);
    if (provider) {
      provider.active = active;
    }
  }
}
