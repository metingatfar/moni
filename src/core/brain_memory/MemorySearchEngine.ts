import { ProjectMemory } from './ProjectMemory';
import { DecisionMemory } from './DecisionMemory';
import { EngineeringHistory } from './EngineeringHistory';

export interface SearchResultItem {
  type: 'decision' | 'task' | 'history';
  title: string;
  details: string;
  confidence?: number;
}

export class MemorySearchEngine {
  public search(
    term: string,
    projectMemory: ProjectMemory,
    decisionMemory: DecisionMemory,
    history: EngineeringHistory
  ): SearchResultItem[] {
    const lowerTerm = term.toLowerCase();
    const results: SearchResultItem[] = [];

    // 1. Search Decisions
    for (const d of decisionMemory.getDecisions()) {
      if (
        d.decision.toLowerCase().includes(lowerTerm) ||
        d.justification.toLowerCase().includes(lowerTerm) ||
        d.category.toLowerCase().includes(lowerTerm)
      ) {
        results.push({
          type: 'decision',
          title: `${d.category} Choice: ${d.decision}`,
          details: d.justification,
          confidence: d.confidence
        });
      }
    }

    // 2. Search Tasks
    const proj = projectMemory.getProject();
    for (const t of proj.openTasks) {
      if (t.toLowerCase().includes(lowerTerm)) {
        results.push({
          type: 'task',
          title: `Open Task`,
          details: t
        });
      }
    }
    for (const t of proj.completedTasks) {
      if (t.toLowerCase().includes(lowerTerm)) {
        results.push({
          type: 'task',
          title: `Completed Task`,
          details: t
        });
      }
    }

    // 3. Search History
    for (const m of history.getMilestones()) {
      if (
        m.sprint.toLowerCase().includes(lowerTerm) ||
        m.module.toLowerCase().includes(lowerTerm) ||
        m.milestone.toLowerCase().includes(lowerTerm)
      ) {
        results.push({
          type: 'history',
          title: `${m.sprint} Milestone`,
          details: `${m.module}: ${m.milestone} on ${m.date}`,
          confidence: m.confidence
        });
      }
    }

    return results;
  }
}

export const memorySearchEngine = new MemorySearchEngine();
export default memorySearchEngine;
