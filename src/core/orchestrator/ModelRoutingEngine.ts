import { providerSelector } from './ProviderSelector';

export interface RoutingDecision {
  providerName: string;
  reason: string;
  confidence: number;
}

export class ModelRoutingEngine {
  public routeRequest(
    request: string,
    contextLength: number,
    complexity: 'Low' | 'Medium' | 'High'
  ): RoutingDecision {
    const lower = request.toLowerCase();
    
    // Choose selected provider based on simple routing logic
    if (lower.includes('architecture') || lower.includes('mimari')) {
      return {
        providerName: 'Claude',
        reason: 'Selected Claude for high-level software architecture reasoning and restructuring.',
        confidence: 0.95
      };
    }

    if (lower.includes('bug') || lower.includes('hata') || lower.includes('fix')) {
      return {
        providerName: 'GPT',
        reason: 'Routed to GPT for localized debugging, coding syntax correction and validation.',
        confidence: 0.90
      };
    }

    if (contextLength > 80000) {
      return {
        providerName: 'Gemini',
        reason: 'Selected Gemini for high capacity long context window operations.',
        confidence: 0.98
      };
    }

    // Default fallback to selector
    try {
      const optimal = providerSelector.selectOptimalProvider(request, 100, contextLength, complexity, 'TypeScript');
      return {
        providerName: optimal.metadata.name,
        reason: `Routed by selector heuristic to ${optimal.metadata.name}`,
        confidence: 0.85
      };
    } catch (_) {
      return {
        providerName: 'Local LLM',
        reason: 'Default local provider fallback',
        confidence: 0.70
      };
    }
  }
}

export const modelRoutingEngine = new ModelRoutingEngine();
export default modelRoutingEngine;
