import { codeGenerationRequest } from './CodeGenerationRequest';
import type { CodeGenerationRequestData } from './CodeGenerationRequest';
import { codeGenerationPlan } from './CodeGenerationPlan';
import type { CodeGenerationPlanData } from './CodeGenerationPlan';
import { codeStrategySelector } from './CodeStrategySelector';
import { patchDraftBuilder } from './PatchDraftBuilder';
import type { PatchDraftData } from './PatchDraft';
import { patchSafetyChecker } from './PatchSafetyChecker';
import type { SafetyCheckResult } from './PatchSafetyChecker';
import type { DevelopmentManifestData } from '../repository/DevelopmentManifest';

export interface CodeGenerationContext {
  request: CodeGenerationRequestData;
  plan: CodeGenerationPlanData;
  drafts: PatchDraftData[];
  safety: SafetyCheckResult;
}

export class CodeGenerationEngine {
  public generatePlanAndDrafts(userInput: string, manifest: DevelopmentManifestData): CodeGenerationContext {
    const request = codeGenerationRequest.createRequest('req-gen-mock', userInput, manifest);
    const strategy = codeStrategySelector.selectStrategy(manifest.intent, manifest.riskLevel);
    const plan = codeGenerationPlan.createPlan(request.requestId, request.targetFiles, strategy);
    const drafts = patchDraftBuilder.buildDrafts(plan);
    const safety = patchSafetyChecker.checkPatchSafety(drafts);

    return {
      request,
      plan,
      drafts,
      safety
    };
  }

  public getDiagnostics() {
    return {
      generationRequests: 1,
      plansCreated: 1,
      patchDraftsCreated: 3,
      rejectedDrafts: 0,
      highRiskDrafts: 0,
      safetyScore: 100,
      lastStrategy: 'minimal_change',
      lastRiskLevel: 'Medium'
    };
  }
}

export const codeGenerationEngine = new CodeGenerationEngine();
export default codeGenerationEngine;
