import { container } from '../container/ServiceContainer';

export interface ExportData {
  longTermMemory: any[];
  knowledgeGraph: { nodes: any[]; edges: any[] };
  goals: any[];
  workflows: any[];
  cognitiveLearning: { experiences: any[]; scores: any };
  executiveState: any;
  ownerProfile: any;
  diagnosticsSnapshot: any;
  releaseMetadata: any;
}

export class DataExportService {
  public exportAll(): ExportData {
    let longTermMemory: any[] = [];
    try {
      const ltm = container.resolve<any>('LongTermMemory');
      if (ltm && typeof ltm.getFacts === 'function') {
        longTermMemory = ltm.getFacts();
      }
    } catch (_) {}

    let knowledgeGraph: { nodes: any[]; edges: any[] } = { nodes: [], edges: [] };
    try {
      const ke = container.resolve<any>('KnowledgeEngine');
      if (ke && typeof ke.getDiagnostics === 'function') {
        const diag = ke.getDiagnostics();
        knowledgeGraph = {
          nodes: [{ id: 'owner', label: diag.ownerName }],
          edges: []
        };
      }
    } catch (_) {}

    let goals: any[] = [];
    try {
      const ge = container.resolve<any>('GoalEngine');
      if (ge && typeof ge.getGoals === 'function') {
        goals = ge.getGoals();
      }
    } catch (_) {}

    let workflows: any[] = [];
    try {
      const we = container.resolve<any>('WorkflowEngine');
      if (we && typeof we.getWorkflows === 'function') {
        workflows = we.getWorkflows();
      }
    } catch (_) {}

    let cognitiveLearning = { experiences: [], scores: {} };
    try {
      const cle = container.resolve<any>('CognitiveLearningEngine');
      if (cle) {
        cognitiveLearning = {
          experiences: cle.collector.getExperiences(),
          scores: cle.scores.getScores()
        };
      }
    } catch (_) {}

    let executiveState = {};
    try {
      const aee = container.resolve<any>('AutonomousExecutiveEngine');
      if (aee) {
        executiveState = aee.stateManager.getState();
      }
    } catch (_) {}

    const ownerProfile = {
      ownerName: 'Metin GATFAR',
      isPermanentOwnerIdentity: true
    };

    return {
      longTermMemory,
      knowledgeGraph,
      goals,
      workflows,
      cognitiveLearning,
      executiveState,
      ownerProfile,
      diagnosticsSnapshot: {},
      releaseMetadata: {
        sprint: 'Sprint 3.6.1',
        exportedAt: new Date().toISOString()
      }
    };
  }
}
export const dataExportService = new DataExportService();
