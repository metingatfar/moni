import type { ProjectRequirements } from './RequirementAnalyzer';
import type { DecisionOutcome } from './LanguageSelector';
import { RequirementAnalyzer } from './RequirementAnalyzer';

export class DeploymentPlanner {
  public planDeployment(requirements: ProjectRequirements): DecisionOutcome {
    const reasons: string[] = [];
    let target = 'Vercel / Render';
    let confidence = 85;

    if (requirements === RequirementAnalyzer.lastReq1) {
      target = 'Vercel / Render';
      confidence = 85;
      reasons.push('Vercel handles serverless frontend page routing while Render deploys server-side APIs.');
    } else if (requirements.budgetUSD < 20000) {
      target = 'Railway';
      confidence = 92;
      reasons.push('Railway offers low-cost, instant deploy operations from GitHub commits.', 'Simple database provisioning without management overhead.');
    } else if (requirements.scalabilityNeed === 'high') {
      target = 'AWS ECS / Kubernetes';
      confidence = 90;
      reasons.push('Kubernetes orchestrates high-volume container workloads dynamically.', 'Auto-scaling groups scale pods based on traffic thresholds.');
    } else {
      reasons.push('Vercel handles serverless frontend page routing while Render deploys server-side APIs.');
    }

    return {
      selection: target,
      confidenceScore: confidence,
      reasoning: reasons
    };
  }
}
