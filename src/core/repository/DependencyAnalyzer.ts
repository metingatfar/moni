export interface DependencyMapping {
  module: string;
  dependsOn: string[];
  importedBy: string[];
}

export class DependencyAnalyzer {
  private relations: DependencyMapping[] = [
    { module: 'AutonomousExecutiveEngine', dependsOn: ['ExecutiveBrain'], importedBy: [] },
    { module: 'ExecutiveBrain', dependsOn: ['ReasoningEngine', 'PlanningEngine', 'ToolIntelligenceEngine', 'CognitiveLearningEngine'], importedBy: ['Bootstrap'] },
    { module: 'ReasoningEngine', dependsOn: [], importedBy: ['ExecutiveBrain'] },
    { module: 'PlanningEngine', dependsOn: [], importedBy: ['ExecutiveBrain'] },
    { module: 'ToolIntelligenceEngine', dependsOn: [], importedBy: ['ExecutiveBrain'] },
    { module: 'CognitiveLearningEngine', dependsOn: [], importedBy: ['ExecutiveBrain'] }
  ];

  public analyzeDependencies(): DependencyMapping[] {
    return [...this.relations];
  }

  public getModuleDependencies(moduleName: string): string[] {
    const found = this.relations.find(r => r.module === moduleName);
    return found ? found.dependsOn : [];
  }
}

export const dependencyAnalyzer = new DependencyAnalyzer();
export default dependencyAnalyzer;
