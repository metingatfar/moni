import type { DecisionOutcome } from './LanguageSelector';

export class StateManagementPlanner {
  public planStateManagement(framework: string): DecisionOutcome {
    const reasons: string[] = [];
    let stateLib = 'Zustand';
    let confidence = 85;

    if (framework === 'Flutter') {
      stateLib = 'Riverpod';
      confidence = 95;
      reasons.push('Riverpod offers compile-safe state providers without BuildContext dependency leaks.', 'Excellent testing support through mock provider overrides.');
    } else if (framework === 'Next.js' || framework === 'React') {
      stateLib = 'Zustand';
      confidence = 90;
      reasons.push('Zustand is lightweight and uses hooks without boilerplate wrapping.', 'Prevents unnecessary component re-renders.');
    } else if (framework === 'Vue') {
      stateLib = 'Pinia';
      confidence = 95;
      reasons.push('Pinia is the modern, official state library for Vue 3.', 'Includes DevTools support and clean TypeScript integrations.');
    } else {
      reasons.push('Zustand provides a simple, direct state container schema suitable for general JavaScript environments.');
    }

    return {
      selection: stateLib,
      confidenceScore: confidence,
      reasoning: reasons
    };
  }
}
