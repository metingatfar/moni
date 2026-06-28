import type { ProjectRequirements } from './RequirementAnalyzer';
import type { DecisionOutcome } from './LanguageSelector';

export class ArchitecturePlanner {
  public planArchitecture(requirements: ProjectRequirements): DecisionOutcome {
    const reasons: string[] = [];
    let pattern = 'Clean Architecture';
    let confidence = 85;

    if (requirements.category === 'backend_api' && requirements.scalabilityNeed === 'high') {
      pattern = 'Microservices / Event Driven';
      confidence = 90;
      reasons.push('Decouples domains into independent horizontal scaling workloads.', 'Improves fault isolation across distributed servers.');
    } else if (requirements.businessDomain === 'erp') {
      pattern = 'CQRS (Command Query Responsibility Segregation)';
      confidence = 88;
      reasons.push('Separates reads and writes to optimize heavy report fetching transactions.', 'Ensures transactional audit logs consistency.');
    } else {
      reasons.push('Clean Architecture decouples core business entities from external frameworks.', 'Allows changing databases or frontends with zero core business logic rewrites.');
    }

    return {
      selection: pattern,
      confidenceScore: confidence,
      reasoning: reasons
    };
  }
}
