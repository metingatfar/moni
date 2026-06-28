import type { DevelopmentIntent } from './DevelopmentIntentAnalyzer';
import type { FileClassification } from './FileSelectionEngine';

export interface DevelopmentManifestData {
  requestId: string;
  intent: DevelopmentIntent;
  affectedModules: string[];
  affectedFiles: FileClassification[];
  riskLevel: 'Low' | 'Medium' | 'High';
  estimatedMinutes: number;
  rollbackPlan: string[];
  approvalRequired: boolean;
  plannedTasks: string[];
  dependencies: string[];
  confidenceScore: number;
}

export class DevelopmentManifest {
  public createManifest(requestId: string, intent: DevelopmentIntent, files: FileClassification[]): DevelopmentManifestData {
    return {
      requestId,
      intent,
      affectedModules: ['ExecutiveBrain', 'MoniDashboard'],
      affectedFiles: files,
      riskLevel: 'Medium',
      estimatedMinutes: 45,
      rollbackPlan: ['Restore changed files', 'Reset git head'],
      approvalRequired: true,
      plannedTasks: [
        'Initialize component bindings',
        'Verify context variables',
        'Build client interface'
      ],
      dependencies: ['CodeIntelligenceEngine', 'RepositoryIntelligenceEngine'],
      confidenceScore: 94
    };
  }
}

export const developmentManifest = new DevelopmentManifest();
export default developmentManifest;
