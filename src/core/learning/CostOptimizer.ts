import { container } from '../container/ServiceContainer';

export class CostOptimizer {
  private savedTokens = 0;
  private totalOptimizations = 0;

  public shouldSkipPipeline(input: string, _activeGoals: string[]): boolean {
    const text = input.toLowerCase().trim();
    
    // 1. Simple keyword command bypass (avoid agent coordinator / Multi-Agent LLM routing)
    const simpleCommands = ['merhaba', 'selam', 'nasılsın', 'teşekkürler', 'sağ ol', 'kimsin'];
    if (simpleCommands.some(cmd => text === cmd)) {
      this.totalOptimizations++;
      this.savedTokens += 50; // estimated prompt tokens saved
      return true;
    }

    // 2. Cooldown check: if both providers are in cooldown, don't attempt pipeline execution
    try {
      const aiOrch = container.resolve<any>('AIOrchestrator');
      if (aiOrch && aiOrch.getLlmMode() === 'Cooldown') {
        this.totalOptimizations++;
        return true;
      }
    } catch (_) {}

    return false;
  }

  public getSavedTokens(): number {
    return this.savedTokens;
  }

  public getTotalOptimizations(): number {
    return this.totalOptimizations;
  }

  public getAverageCost(): number {
    // Arbitrary metric showing average simulated request cost in credits/tokens
    return Math.max(10, 100 - (this.totalOptimizations * 2));
  }
}

export const costOptimizer = new CostOptimizer();
