import type { DecisionOutcome } from './LanguageSelector';

export class DecisionExplainer {
  public formatExplanation(decision: DecisionOutcome): string {
    const lines: string[] = [];
    lines.push(`✔ Selection: ${decision.selection}`);
    decision.reasoning.forEach(r => {
      lines.push(`  - ${r}`);
    });
    lines.push(`Confidence: ${decision.confidenceScore}%`);
    return lines.join('\n');
  }
}
