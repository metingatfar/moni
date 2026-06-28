import type { AIProvider } from './AIProviderPool';

export class CostOptimizer {
  public selectBestProvider(providers: AIProvider[], requirements: { maxCost: number; minLatencyMs: number }): AIProvider {
    const candidates = providers.filter(p => p.costPerMillionTokens <= requirements.maxCost && p.latencyMs >= requirements.minLatencyMs);
    if (candidates.length === 0) {
      // return cheapest general active provider
      return [...providers].sort((a, b) => a.costPerMillionTokens - b.costPerMillionTokens)[0];
    }
    return candidates.sort((a, b) => a.costPerMillionTokens - b.costPerMillionTokens)[0];
  }
}
