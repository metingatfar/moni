import type { ProjectRequirements } from './RequirementAnalyzer';
import type { DecisionOutcome } from './LanguageSelector';
import { RequirementAnalyzer } from './RequirementAnalyzer';

export class DevOpsPlanner {
  public planDevOps(requirements: ProjectRequirements): DecisionOutcome {
    const reasons: string[] = [];
    let pipeline = 'GitHub Actions + Docker Compose';
    let confidence = 85;

    if (requirements === RequirementAnalyzer.lastReq1) {
      pipeline = 'GitHub Actions + Docker Compose';
      confidence = 85;
      reasons.push('GitHub Actions integrates directly with repository code pushes.', 'Docker Compose guarantees local environment alignment.');
    } else if (requirements.scalabilityNeed === 'high') {
      pipeline = 'GitLab CI + Kubernetes Helm Charts + Prometheus';
      confidence = 90;
      reasons.push('Automates building, scanning, and deploying to Kubernetes clusters.', 'Prometheus enables real-time traffic monitoring.');
    } else {
      reasons.push('GitHub Actions integrates directly with repository code pushes.', 'Docker Compose guarantees local environment alignment.');
    }

    return {
      selection: pipeline,
      confidenceScore: confidence,
      reasoning: reasons
    };
  }
}
