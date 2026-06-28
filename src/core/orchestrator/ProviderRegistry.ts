import type { AIProvider } from './AIProvider';

export class ProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();

  public registerProvider(name: string, provider: AIProvider): void {
    this.providers.set(name, provider);
  }

  public getProvider(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  public getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  public getAvailableProviders(): AIProvider[] {
    return this.getAllProviders().filter(p => p.metadata.status === 'active');
  }
}

export const providerRegistry = new ProviderRegistry();
export default providerRegistry;
