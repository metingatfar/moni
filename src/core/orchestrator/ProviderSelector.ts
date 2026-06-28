import type { AIProvider } from './AIProvider';
import { providerRegistry } from './ProviderRegistry';

export class ProviderSelector {
  public selectOptimalProvider(
    taskType: string,
    repoSize: number,
    contextSize: number,
    complexity: 'Low' | 'Medium' | 'High',
    language: string
  ): AIProvider {
    console.log(`[ProviderSelector] Analyzing provider for task: ${taskType} in ${language} (Complexity: ${complexity}, Size: ${repoSize})`);
    const providers = providerRegistry.getAvailableProviders();
    if (providers.length === 0) {
      throw new Error('No active AI providers registered.');
    }

    // Default simple heuristic selection
    let bestProvider = providers[0];
    let bestScore = -1;

    for (const p of providers) {
      const caps = p.getCapabilities();
      let score = 0;

      if (taskType.toLowerCase().includes('architecture')) {
        score += caps['architecture'] || 0;
      } else if (taskType.toLowerCase().includes('bug') || taskType.toLowerCase().includes('fix')) {
        score += caps['debugging'] || 0;
      } else {
        score += caps['coding'] || 0;
      }

      if (contextSize > 100000) {
        score += caps['longContext'] || 0;
      }

      if (score > bestScore) {
        bestScore = score;
        bestProvider = p;
      }
    }

    return bestProvider;
  }
}

export const providerSelector = new ProviderSelector();
export default providerSelector;
