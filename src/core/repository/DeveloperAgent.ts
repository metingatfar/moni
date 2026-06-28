import { developmentIntentAnalyzer } from './DevelopmentIntentAnalyzer';
import type { DevelopmentIntent } from './DevelopmentIntentAnalyzer';
import { changeImpactAnalyzer } from './ChangeImpactAnalyzer';
import type { ChangeImpact } from './ChangeImpactAnalyzer';
import { changeScopeAnalyzer } from './ChangeScopeAnalyzer';
import type { ChangeScope } from './ChangeScopeAnalyzer';
import { fileSelectionEngine } from './FileSelectionEngine';
import type { FileClassification } from './FileSelectionEngine';
import { patchPlanner } from './PatchPlanner';
import type { PatchPlan } from './PatchPlanner';
import { riskAssessmentEngine } from './RiskAssessmentEngine';
import type { RiskMetrics } from './RiskAssessmentEngine';
import { developmentChecklist } from './DevelopmentChecklist';
import { developmentManifest } from './DevelopmentManifest';
import type { DevelopmentManifestData } from './DevelopmentManifest';
import { userApprovalManager } from './UserApprovalManager';

export interface DevelopmentPlan {
  requestId: string;
  intent: DevelopmentIntent;
  impact: ChangeImpact;
  scope: ChangeScope;
  files: FileClassification[];
  plan: PatchPlan;
  risk: RiskMetrics;
  checklist: string[];
  manifest: DevelopmentManifestData;
  approvalPending: boolean;
}

export class DeveloperAgent {
  public generateDevelopmentPlan(requestText: string): DevelopmentPlan {
    const requestId = 'req-dev-mock';
    const intent = developmentIntentAnalyzer.analyzeIntent(requestText);
    const impact = changeImpactAnalyzer.analyzeImpact(intent);
    const scope = changeScopeAnalyzer.determineScope(impact.impactScore);
    const files = fileSelectionEngine.selectFiles(requestText);
    const plan = patchPlanner.generatePlan(requestText);
    const risk = riskAssessmentEngine.calculateRisk(requestText);
    const checklist = developmentChecklist.generateChecklist(intent);
    const manifest = developmentManifest.createManifest(requestId, intent, files);
    
    userApprovalManager.requestApproval(requestId);

    return {
      requestId,
      intent,
      impact,
      scope,
      files,
      plan,
      risk,
      checklist,
      manifest,
      approvalPending: true
    };
  }

  public getDiagnostics() {
    return this.generateDevelopmentPlan('Refactor service bootstrap logic');
  }
}

export const developerAgent = new DeveloperAgent();
export default developerAgent;
