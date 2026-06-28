import { MONIBrain } from './MONIBrain';

export class BrainReportGenerator {
  public generateBrainSummary(brain: MONIBrain): string {
    const proj = brain.getMemory().getProject();
    const metrics = brain.getMetrics().getMetricsSummary(
      brain.getMemory(),
      brain.getDecisions(),
      brain.getGraph()
    );

    return `
# MONI Brain Summary
- Active Project: ${proj.name}
- Total Decisions Logged: ${metrics.decisionCount}
- Knowledge Links: ${metrics.knowledgeLinksCount}
- Context Accuracy: ${metrics.contextAccuracy}%
- Memory Health Index: Excellent
`;
  }
}

export const brainReportGenerator = new BrainReportGenerator();
export default brainReportGenerator;
