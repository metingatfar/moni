import { ProjectMemory } from './ProjectMemory';
import { DecisionMemory } from './DecisionMemory';
import { EngineeringHistory } from './EngineeringHistory';

export class ContextBuilder {
  public constructContextText(
    projectMemory: ProjectMemory,
    decisionMemory: DecisionMemory,
    history: EngineeringHistory
  ): string {
    const proj = projectMemory.getProject();
    const decisions = decisionMemory.getDecisions();
    const milestones = history.getMilestones();

    const techStackStr = proj.techStack.join(', ');
    const openTasksStr = proj.openTasks.map(t => `- [ ] ${t}`).join('\n');
    const decisionsStr = decisions.map(d => `- [Decision: ${d.decision}] Reason: ${d.justification} (Confidence: ${d.confidence}%)`).join('\n');
    const recentMilestone = milestones[milestones.length - 1];

    return `
=== MONI PERSISTENT CONTEXT ===
- Active Project: ${proj.name}
- Domain: ${proj.domain}
- Technology Stack: ${techStackStr}
- Current Milestone: ${recentMilestone ? `${recentMilestone.sprint} - ${recentMilestone.milestone}` : 'None'}
- Overall Confidence: ${proj.confidence}%

## Active Open Tasks
${openTasksStr || '- None'}

## Architectural Decisions History
${decisionsStr || '- None'}

## Risk Assessment
${proj.risks.map(r => `- Warning: ${r}`).join('\n') || '- None'}
==============================
`;
  }
}

export const contextBuilder = new ContextBuilder();
export default contextBuilder;
