import type { KnowledgeDocument } from './KnowledgeDocument';

export interface SprintTimelineEntry {
  sprintName: string;
  sprintNumber: number;
  modulesIntroduced: string[];
  completionDate: string;
  notes: string;
}

export class SprintHistoryIndexer {
  private timeline: SprintTimelineEntry[] = [
    {
      sprintName: 'Sprint 4.1-A — Repository Intelligence Engine',
      sprintNumber: 1,
      modulesIntroduced: ['RepositoryScanner', 'ArchitectureIndex', 'ProjectHealthEngine'],
      completionDate: '2026-06-10',
      notes: 'Initial codebase analysis and indexing features.'
    },
    {
      sprintName: 'Sprint 4.1-B — Code Intelligence & Deep Symbol Scan',
      sprintNumber: 2,
      modulesIntroduced: ['CodeIntelligenceEngine', 'SymbolIndex', 'CallGraphAnalyzer'],
      completionDate: '2026-06-15',
      notes: 'Deep analysis of class/function/type code symbols.'
    },
    {
      sprintName: 'Sprint 4.2-A — Developer Planning Agent',
      sprintNumber: 3,
      modulesIntroduced: ['DeveloperAgent', 'ChangePlanGenerator', 'ImpactAnalyzer'],
      completionDate: '2026-06-18',
      notes: 'Autonomous plan formulation matching user feature requests.'
    },
    {
      sprintName: 'Sprint 4.2-B — Patch Generation & Sandbox Validation',
      sprintNumber: 4,
      modulesIntroduced: ['CodeGenerationEngine', 'PatchApplicationEngine', 'SandboxWorkspace'],
      completionDate: '2026-06-20',
      notes: 'Generates patch drafts and validates compilation inside sandbox.'
    },
    {
      sprintName: 'Sprint 4.2-C — Apply Preparation & Secure Pipeline',
      sprintNumber: 5,
      modulesIntroduced: ['ApplyPreparationEngine', 'ReadyToApplyManifest', 'ApprovalPackageBuilder'],
      completionDate: '2026-06-22',
      notes: 'Enforces complete secure verification pipeline before user review.'
    },
    {
      sprintName: 'Sprint 4.3-A — AI Coding Orchestrator Foundation',
      sprintNumber: 6,
      modulesIntroduced: ['AICodingOrchestrator', 'ProviderRegistry', 'ProviderSelector', 'PromptCompiler'],
      completionDate: '2026-06-23',
      notes: 'Orchestrates prompting context, cost rates, and token budgets.'
    },
    {
      sprintName: 'Sprint 4.3-B — LLM Execution Engine & Multi-Provider Runtime',
      sprintNumber: 7,
      modulesIntroduced: ['LLMExecutionEngine', 'LLMRuntime', 'ResponseValidator', 'ResponseNormalizer'],
      completionDate: '2026-06-24',
      notes: 'Executes prompts against mock OpenAI, Anthropic, Gemini, Ollama, DeepSeek adapters.'
    },
    {
      sprintName: 'Sprint 4.3-C — AI Consensus Engine & Multi-Agent Reasoning',
      sprintNumber: 8,
      modulesIntroduced: ['AIConsensusEngine', 'ConsensusAnalyzer', 'ConflictResolver', 'EngineeringReasoner'],
      completionDate: '2026-06-24',
      notes: 'Resolves strategy conflicts and audits combined provider proposals.'
    },
    {
      sprintName: 'Sprint 4.3-D — Knowledge Base & Architectural Memory Engine',
      sprintNumber: 9,
      modulesIntroduced: ['KnowledgeBaseEngine', 'SprintHistoryIndexer', 'ArchitectureDecisionMemory', 'KnowledgeSearchEngine'],
      completionDate: '2026-06-24',
      notes: 'Introduces sprint timelines, ADRs, module histories, and engineering terms vocabulary.'
    }
  ];

  public getTimeline(): SprintTimelineEntry[] {
    return this.timeline;
  }

  public getDocuments(): KnowledgeDocument[] {
    return this.timeline.map(entry => ({
      id: `SPRINT-${entry.sprintNumber.toString().padStart(4, '0')}`,
      title: entry.sprintName,
      category: 'sprint' as const,
      content: `Sprint: ${entry.sprintName}\nModules: ${entry.modulesIntroduced.join(', ')}\nNotes: ${entry.notes}`,
      sprint: entry.sprintNumber,
      metadata: { modules: entry.modulesIntroduced, date: entry.completionDate },
      timestamp: new Date(entry.completionDate).toISOString()
    }));
  }
}

export const sprintHistoryIndexer = new SprintHistoryIndexer();
export default sprintHistoryIndexer;
