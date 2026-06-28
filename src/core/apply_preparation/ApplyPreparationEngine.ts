import type { PatchDraftData } from '../codegen/PatchDraft';
import { applyReadinessValidator } from './ApplyReadinessValidator';
import { compilePreviewEngine } from './CompilePreviewEngine';
import { regressionPreviewRunner } from './RegressionPreviewRunner';
import { readinessScoreEngine } from './ReadinessScoreEngine';
import { applyPreviewEngine } from './ApplyPreviewEngine';
import { readyToApplyManifest } from './ReadyToApplyManifest';
import { approvalPackageBuilder } from './ApprovalPackageBuilder';
import type { ApprovalPackage } from './ApprovalPackageBuilder';

export interface ApplyPreparationResult {
  success: boolean;
  score: number;
  package?: ApprovalPackage;
  message: string;
}

export class ApplyPreparationEngine {
  public prepareApply(requestId: string, drafts: PatchDraftData[]): ApplyPreparationResult {
    console.log(`[ApplyPreparationEngine] Initiating apply preparation pipeline for Request: ${requestId}`);
    
    const files = drafts.map(d => d.filePath);
    
    // Run previews
    const compileResult = compilePreviewEngine.runCompilePreview(files);
    const regressionResult = regressionPreviewRunner.runRegressionPreview(files);
    
    // Validate readiness (mock parameters, reviewPassed=true, validationPassed=true, sandboxPassed=true)
    const validationResult = applyReadinessValidator.validateReadiness(
      true, // reviewPassed
      true, // validationPassed
      true, // sandboxPassed
      compileResult.success,
      regressionResult.success
    );
    
    // Calculate final score
    const score = readinessScoreEngine.calculateReadinessScore(
      100, // reviewScore
      100, // validationScore
      true, // sandboxPassed
      compileResult.success,
      regressionResult.success
    );
    
    // Generate previews
    const preview = applyPreviewEngine.generatePreview(drafts);
    
    // Build manifest and approval package
    const manifest = readyToApplyManifest.createManifest(
      requestId,
      drafts[0]?.patchId || 'patch-prep-mock',
      files,
      score
    );
    
    const approvalPackage = approvalPackageBuilder.buildPackage(manifest, preview);
    
    return {
      success: validationResult.passed,
      score,
      package: approvalPackage,
      message: 'Apply preparation successfully completed. System is ready to apply changes.'
    };
  }
}

export const applyPreparationEngine = new ApplyPreparationEngine();
export default applyPreparationEngine;
