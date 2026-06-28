import { LiveDebugger } from './LiveDebugger';
import { ErrorClassifier } from './ErrorClassifier';
import { rootCauseAnalyzer } from './RootCauseAnalyzer';
import { FixPlanner } from './FixPlanner';
import { PatchPlanner } from './PatchPlanner';
import { PatchValidator } from './PatchValidator';
import { RegressionAnalyzer } from './RegressionAnalyzer';
import { RollbackPlanner } from './RollbackPlanner';
import { ApprovalPackageGenerator } from './ApprovalPackageGenerator';
import type { HealingApprovalPackage } from './ApprovalPackageGenerator';

export class HealingCoordinator {
  private debugger = new LiveDebugger();
  private classifier = new ErrorClassifier();
  private fixPlanner = new FixPlanner();
  private patchPlanner = new PatchPlanner();
  private validator = new PatchValidator();
  private regressionAnalyzer = new RegressionAnalyzer();
  private rollbackPlanner = new RollbackPlanner();
  private packageGenerator = new ApprovalPackageGenerator();

  public async coordinateRepair(
    errorLogs: string,
    targetFile: string
  ): Promise<HealingApprovalPackage> {
    const session = this.debugger.startSession(`dbg-sess-${Date.now()}`, 'SelfHealingSubsystem');

    // 1. Detect & Classify
    this.debugger.logEvent(session.sessionId, 'Detecting and classifying error log.');
    const classification = this.classifier.classify(errorLogs, '');

    // 2. Root Cause
    this.debugger.logEvent(session.sessionId, 'Running root cause analysis.');
    const mockParsedError = {
      errorCode: classification.category === 'syntax' ? 'TS2304' : 'TS6133',
      file: targetFile,
      symbol: 'mockIdentifier',
      probableCause: classification.description,
      line: 12,
      column: 1
    };
    const rcResult = rootCauseAnalyzer.analyze([mockParsedError]);

    // 3. Plan Fix
    this.debugger.logEvent(session.sessionId, 'Generating fix plan.');
    const fixPlan = this.fixPlanner.planFix(classification.category, rcResult.probableCause);

    // 4. Generate Patch Draft
    this.debugger.logEvent(session.sessionId, 'Creating patch draft.');
    const patchDraft = this.patchPlanner.generatePatchDraft(targetFile, fixPlan.strategy, rcResult.probableCause);

    // 5. Validate Patch
    this.debugger.logEvent(session.sessionId, 'Running validation gate checks.');
    const valResult = this.validator.validatePatch(patchDraft);
    this.debugger.logEvent(session.sessionId, `Validation score: ${valResult.score}/100`);

    // 6. Regression Check
    this.debugger.logEvent(session.sessionId, 'Auditing regression potential.');
    const regResult = this.regressionAnalyzer.analyzeRegression(patchDraft);

    // 7. Rollback Checkpoint
    this.debugger.logEvent(session.sessionId, 'Preparing rollback plan.');
    const rollback = this.rollbackPlanner.planRollback('chk-1', classification.category);

    this.debugger.endSession(session.sessionId);

    // 8. Generate Approval Package
    return this.packageGenerator.generateApprovalPackage(
      classification.description,
      rcResult,
      regResult,
      patchDraft,
      rollback.rollbackId,
      rollback.actions
    );
  }
}
