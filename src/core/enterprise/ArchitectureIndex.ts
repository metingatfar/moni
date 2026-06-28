export interface IndexEntry {
  moduleName: string;
  type: 'Engine' | 'Service' | 'Tool' | 'Script' | 'Test';
  sprintIntroduced: string;
  dependencies: string[];
}

export class ArchitectureIndex {
  private index: IndexEntry[] = [
    { moduleName: 'ReasoningEngine', type: 'Engine', sprintIntroduced: 'Sprint 3.2', dependencies: ['ExplainabilityEngine', 'RiskAnalyzer'] },
    { moduleName: 'KnowledgeEngine', type: 'Engine', sprintIntroduced: 'Sprint 3.3', dependencies: ['KnowledgeGraph', 'PersonalKnowledge'] },
    { moduleName: 'VisionEngine', type: 'Engine', sprintIntroduced: 'Sprint 3.4', dependencies: ['ImageAnalyzer', 'OCRPipeline'] },
    { moduleName: 'CognitiveLearningEngine', type: 'Engine', sprintIntroduced: 'Sprint 3.5', dependencies: ['ExperienceCollector', 'StrategyLearner'] },
    { moduleName: 'AutonomousExecutiveEngine', type: 'Engine', sprintIntroduced: 'Sprint 3.6', dependencies: ['ExecutiveStateManager', 'ExecutivePolicyEngine'] },
    { moduleName: 'VersionManager', type: 'Service', sprintIntroduced: 'Sprint 3.6.2', dependencies: [] },
    { moduleName: 'BackupEncryption', type: 'Service', sprintIntroduced: 'Sprint 3.6.2', dependencies: [] }
  ];

  public getIndex(): IndexEntry[] {
    return [...this.index];
  }

  public getModuleDetails(moduleName: string): IndexEntry | undefined {
    return this.index.find(i => i.moduleName === moduleName);
  }
}
export const architectureIndex = new ArchitectureIndex();
export default architectureIndex;
