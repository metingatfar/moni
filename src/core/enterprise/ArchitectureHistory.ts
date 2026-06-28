export interface SprintHistoryEntry {
  sprintNumber: string;
  releaseDate: string;
  addedModules: string[];
  removedModules: string[];
  modifiedModules: string[];
  architectureNotes: string;
  risks: string;
  technicalDebt: string;
  buildStatus: string;
  testResults: string;
}

export class ArchitectureHistory {
  private history: SprintHistoryEntry[] = [
    {
      sprintNumber: 'Sprint 3.2',
      releaseDate: '2026-06-20',
      addedModules: ['ReasoningEngine', 'ReflectionEngine', 'RiskAnalyzer'],
      removedModules: [],
      modifiedModules: ['ExecutiveBrain'],
      architectureNotes: 'Introduced reasoning thinking layer.',
      risks: 'Low latency increases.',
      technicalDebt: 'None',
      buildStatus: 'success',
      testResults: 'passed'
    },
    {
      sprintNumber: 'Sprint 3.5',
      releaseDate: '2026-06-22',
      addedModules: ['CognitiveLearningEngine', 'PreferenceLearner', 'MistakeAnalyzer'],
      removedModules: [],
      modifiedModules: ['ExecutiveBrain'],
      architectureNotes: 'Added post-execution learning feedback loop.',
      risks: 'None',
      technicalDebt: 'LocalStorage persistence needed.',
      buildStatus: 'success',
      testResults: 'passed'
    },
    {
      sprintNumber: 'Sprint 3.6',
      releaseDate: '2026-06-23',
      addedModules: ['AutonomousExecutiveEngine', 'ExecutiveStateManager', 'ExecutivePolicyEngine'],
      removedModules: [],
      modifiedModules: ['ExecutiveBrain'],
      architectureNotes: 'Added central executive orchestrator wrapper.',
      risks: 'High coordination complexity.',
      technicalDebt: 'Needs persistent rollback states.',
      buildStatus: 'success',
      testResults: 'passed'
    }
  ];

  public getHistory(): SprintHistoryEntry[] {
    return [...this.history];
  }

  public getSprintChanges(sprint: string): SprintHistoryEntry | undefined {
    return this.history.find(h => h.sprintNumber === sprint);
  }

  public querySprintDiff(sprintA: string, sprintB: string): string {
    const entryA = this.getSprintChanges(sprintA);
    const entryB = this.getSprintChanges(sprintB);
    if (!entryA || !entryB) {
      return 'Sprint entries not found for comparison.';
    }
    return `Comparison between ${sprintA} and ${sprintB}:\n- ${sprintA} added: ${entryA.addedModules.join(', ')}\n- ${sprintB} added: ${entryB.addedModules.join(', ')}`;
  }
}
export const architectureHistory = new ArchitectureHistory();
export default architectureHistory;
