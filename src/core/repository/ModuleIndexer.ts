export interface IndexedModule {
  name: string;
  type: 'Engine' | 'Service' | 'Tool' | 'Script' | 'Test';
  path: string;
  description: string;
}

export class ModuleIndexer {
  private knownModules: IndexedModule[] = [
    { name: 'ExecutiveBrain', type: 'Engine', path: 'src/core/brain/ExecutiveBrain.ts', description: 'Central orchestrator coordinating memory, reasoning, and tools.' },
    { name: 'AutonomousExecutiveEngine', type: 'Engine', path: 'src/core/executive/AutonomousExecutiveEngine.ts', description: 'Self-coordination and policy engine.' },
    { name: 'ReasoningEngine', type: 'Engine', path: 'src/core/reasoning/ReasoningEngine.ts', description: 'Logical reasoning and chain-of-thought engine.' },
    { name: 'KnowledgeEngine', type: 'Engine', path: 'src/core/knowledge/KnowledgeEngine.ts', description: 'Cognitive personal knowledge base manager.' },
    { name: 'PlanningEngine', type: 'Engine', path: 'src/core/planning/PlanningEngine.ts', description: 'Auto project planner and task roadmap engine.' },
    { name: 'ToolIntelligenceEngine', type: 'Engine', path: 'src/core/tool_intelligence/ToolIntelligenceEngine.ts', description: 'Dynamic intent analyzer and tool selection engine.' },
    { name: 'VisionEngine', type: 'Engine', path: 'src/core/vision/VisionEngine.ts', description: 'Multimodal vision and visual safety engine.' },
    { name: 'CognitiveLearningEngine', type: 'Engine', path: 'src/core/cognitive_learning/CognitiveLearningEngine.ts', description: 'Self-learning feedback loop optimizer.' },
    { name: 'VersionManager', type: 'Service', path: 'src/core/enterprise/VersionManager.ts', description: 'Version boundaries and compatibility service.' },
    { name: 'BackupEncryption', type: 'Service', path: 'src/core/enterprise/BackupEncryption.ts', description: 'AES-256-CBC backup packaging service.' },
    { name: 'ReleaseManager', type: 'Service', path: 'src/core/release/ReleaseManager.ts', description: 'Sprint release dry-run pipeline manager.' }
  ];

  public getModules(): IndexedModule[] {
    return [...this.knownModules];
  }

  public searchModules(query: string): IndexedModule[] {
    const q = query.toLowerCase();
    return this.knownModules.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.description.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q)
    );
  }
}

export const moduleIndexer = new ModuleIndexer();
export default moduleIndexer;
