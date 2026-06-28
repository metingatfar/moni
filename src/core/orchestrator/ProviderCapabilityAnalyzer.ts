import type { AIProvider } from './AIProvider';

export class ProviderCapabilityAnalyzer {
  public analyzeCapabilities(provider: AIProvider): Record<string, number> {
    return provider.getCapabilities();
  }
}

export const providerCapabilityAnalyzer = new ProviderCapabilityAnalyzer();
export default providerCapabilityAnalyzer;
