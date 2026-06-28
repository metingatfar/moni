import type { ProjectRequirements } from './RequirementAnalyzer';
import type { DecisionOutcome } from './LanguageSelector';

export class AIModelSelector {
  public selectAIModel(requirements: ProjectRequirements): DecisionOutcome {
    const reasons: string[] = [];
    let model = 'Claude 3.5 Sonnet (Anthropic)';
    let confidence = 85;

    if (requirements.aiRequirements.includes('llm_reasoning')) {
      if (requirements.securityRequirements.includes('encryption_at_rest') || requirements.budgetUSD < 15000) {
        model = 'Llama 3 (Local Ollama)';
        confidence = 90;
        reasons.push('Local Ollama running Llama 3 keeps data fully private within local network boundaries.', 'Eliminates cloud usage billing API credit costs.');
      } else {
        model = 'Claude 3.5 Sonnet (Anthropic)';
        confidence = 95;
        reasons.push('Claude 3.5 Sonnet leads benchmarks in code generation, logic parsing, and multi-step reasoning.', 'Massive context window supports complex file trees analyzes.');
      }
    } else {
      model = 'Gemini 1.5 Pro (Google)';
      confidence = 88;
      reasons.push('Gemini 1.5 Pro features a 2 million token context window.', 'Extremely fast response speeds and competitive pricing rates.');
    }

    return {
      selection: model,
      confidenceScore: confidence,
      reasoning: reasons
    };
  }
}
