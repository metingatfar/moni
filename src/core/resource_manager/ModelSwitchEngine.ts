export class ModelSwitchEngine {
  public determineAlternativeProvider(currentProviderId: string, remainingTokens: number): string {
    if (remainingTokens < 10000) {
      return 'ollama'; // local free model
    }
    if (currentProviderId === 'claude') {
      return 'gpt'; // fallback to openai
    }
    if (currentProviderId === 'gpt') {
      return 'gemini'; // fallback to gemini
    }
    return 'deepseek'; // cheaper backup
  }
}
