import type { BuilderScreen } from './BuilderScreen';

export interface VisualSuggestion {
  id: string;
  category: 'accessibility' | 'layout' | 'style' | 'performance';
  message: string;
  autoFixAvailable: boolean;
}

export class AISuggestionsPanel {
  public generateSuggestions(screen: BuilderScreen): VisualSuggestion[] {
    const suggestions: VisualSuggestion[] = [];

    // Analyze component density
    if (screen.components.length > 15) {
      suggestions.push({
        id: 'sug-density',
        category: 'layout',
        message: 'High component density. Consider dividing sections into collapsible Cards or tabs to reduce clutter.',
        autoFixAvailable: false
      });
    }

    // Analyze style alignment rules
    const hasUnboundColors = screen.components.some(c => !c.properties.boundTokens.background && !c.properties.boundTokens.color);
    if (hasUnboundColors) {
      suggestions.push({
        id: 'sug-tokens',
        category: 'style',
        message: 'Some components are using default un-bound token settings. Bind them to PrimaryColor or BaseSpacing values.',
        autoFixAvailable: true
      });
    }

    // Analyze accessibility
    const inputs = screen.components.filter(c => c.type === 'Input');
    inputs.forEach(input => {
      if (!input.properties.placeholder) {
        suggestions.push({
          id: `sug-acc-${input.id}`,
          category: 'accessibility',
          message: `Input component ${input.id} is missing a placeholder label to support screen readers.`,
          autoFixAvailable: true
        });
      }
    });

    return suggestions;
  }
}
