import type { ProjectRequirements } from './RequirementAnalyzer';

export interface DecisionOutcome {
  selection: string;
  confidenceScore: number;
  reasoning: string[];
}

export class LanguageSelector {
  public selectLanguage(requirements: ProjectRequirements): DecisionOutcome {
    const reasons: string[] = [];
    let lang = 'TypeScript';
    let confidence = 85;

    if (requirements.businessDomain === 'fitness' && requirements.category === 'mobile_app') {
      lang = 'Dart';
      confidence = 92;
      reasons.push('Dart is optimal for Flutter mobile client compiles.', 'Strong offline layout rendering support.');
    } else if (requirements.complianceConstraints.includes('PCI-DSS') || requirements.complianceConstraints.includes('HIPAA') || requirements.businessDomain === 'erp') {
      lang = 'C#';
      confidence = 88;
      reasons.push('C# provides strong static typing and enterprise readiness.', 'First-class support for secure corporate backend applications.');
    } else if (requirements.businessDomain === 'ai_assistant') {
      lang = 'Python';
      confidence = 95;
      reasons.push('Python is the industry standard for AI integrations.', 'Broad library support for LLM pipelines (LangChain, LlamaIndex).');
    } else if (requirements.scalabilityNeed === 'high' && requirements.category === 'backend_api') {
      lang = 'Go';
      confidence = 90;
      reasons.push('Go yields high performance concurrent request execution.', 'Low memory utilization under heavy network traffic.');
    } else {
      reasons.push('TypeScript offers universal frontend and backend ecosystem compatibility.', 'Rich typing support and massive open-source library choices.');
    }

    return {
      selection: lang,
      confidenceScore: confidence,
      reasoning: reasons
    };
  }
}
