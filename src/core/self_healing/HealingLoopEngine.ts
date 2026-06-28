import { failureClassifier } from './FailureClassifier';
import { errorLogParser } from './ErrorLogParser';
import { rootCauseAnalyzer } from './RootCauseAnalyzer';
import { repairStrategyPlanner } from './RepairStrategyPlanner';
import { repairPatchPlanner } from './RepairPatchPlanner';
import { healingConfidenceScorer } from './HealingConfidenceScorer';
import { retryPolicyEngine } from './RetryPolicyEngine';
import { humanInterventionDetector } from './HumanInterventionDetector';
import { healingHistory } from './HealingHistory';
import { selfHealingReport } from './SelfHealingReport';
import type { FailureEvent } from './FailureEvent';
import type { RepairPatchDraft } from './RepairPatchPlanner';

export interface HealingLoopResult {
  failureId: string;
  finalPatch?: RepairPatchDraft;
  attemptsCount: number;
  finalConfidence: number;
  interventionRequired: boolean;
  interventionReason: string;
  status: 'healed' | 'halted' | 'failed';
  reportsResult: any;
}

export class HealingLoopEngine {
  public async executeHealingLoop(event: FailureEvent): Promise<HealingLoopResult> {
    healingHistory.clear();
    let currentAttempt = 0;
    let shouldContinue = true;
    let finalPatch: RepairPatchDraft | undefined;
    let finalConfidence = 0;
    let interventionRequired = false;
    let interventionReason = 'Safe execution.';
    let loopStatus: 'healed' | 'halted' | 'failed' = 'failed';

    const errorLogs = `${event.errorType}: ${event.message}\n${event.stackTrace}`;

    while (shouldContinue) {
      currentAttempt++;
      
      // 1. Classify
      const classification = failureClassifier.classify(event.message, event.errorType);

      // 2. Parse
      const parsedErrors = errorLogParser.parseLog(errorLogs);

      // 3. Root cause
      const rootCause = rootCauseAnalyzer.analyze(parsedErrors);

      // 4. Strategy
      const repairStrategy = repairStrategyPlanner.planStrategy(classification, rootCause.probableCause);

      // 5. Calculate confidence
      const confidence = healingConfidenceScorer.calculateConfidence(
        rootCause.confidenceScore,
        98, // Patch safety (mock)
        95, // Test pass probability (mock)
        currentAttempt,
        repairStrategy.estimatedRisk
      );
      finalConfidence = confidence;

      // 6. Plan repair patch draft
      const targetFile = parsedErrors[0] ? parsedErrors[0].file : 'unknown_file.ts';
      const targetLine = parsedErrors[0] ? parsedErrors[0].line : 0;
      const targetSymbol = parsedErrors[0] ? parsedErrors[0].symbol : 'symbol';
      const patch = repairPatchPlanner.planRepairPatch(
        targetFile,
        targetLine,
        repairStrategy.strategy,
        targetSymbol
      );
      finalPatch = patch;

      // 7. Add to history
      healingHistory.addRecord({
        failureId: event.failureId,
        attemptNumber: currentAttempt,
        strategyUsed: repairStrategy.strategy,
        success: confidence >= 70, // Success condition
        confidenceScore: confidence,
        errorMessage: event.message,
        timestamp: new Date().toISOString()
      });

      // 8. Human intervention check
      const hasRepeatedFailure = healingHistory.hasRepeatedFailures(event.failureId);
      const intervention = humanInterventionDetector.check(
        event.errorType,
        confidence,
        hasRepeatedFailure,
        repairStrategy.estimatedRisk
      );

      if (intervention.requiresIntervention) {
        interventionRequired = true;
        interventionReason = intervention.reason;
        loopStatus = 'halted';
        shouldContinue = false;
        break;
      }

      // 9. Retry policy decision
      const retryDecision = retryPolicyEngine.evaluateRetry(
        currentAttempt,
        currentAttempt > 1 ? event.message : '',
        event.message,
        confidence,
        repairStrategy.estimatedRisk
      );

      if (confidence >= 70) {
        loopStatus = 'healed';
        shouldContinue = false;
      } else if (!retryDecision.shouldRetry) {
        interventionRequired = true;
        interventionReason = retryDecision.reason;
        loopStatus = 'halted';
        shouldContinue = false;
      }
    }

    // 10. Generate Reports
    const reportsResult = selfHealingReport.generateReports({
      failureId: event.failureId,
      source: event.source,
      errorType: event.errorType,
      message: event.message,
      probableCause: rootCauseAnalyzer.analyze(errorLogParser.parseLog(errorLogs)).probableCause,
      strategy: finalPatch?.strategyUsed || 'Minimal Fix',
      patchId: finalPatch?.id || 'patch-id',
      targetFile: finalPatch?.targetFile || 'unknown_file.ts',
      retryCount: currentAttempt,
      confidence: finalConfidence,
      interventionRequired,
      interventionReason
    });

    return {
      failureId: event.failureId,
      finalPatch,
      attemptsCount: currentAttempt,
      finalConfidence,
      interventionRequired,
      interventionReason,
      status: loopStatus,
      reportsResult
    };
  }
}

export const healingLoopEngine = new HealingLoopEngine();
export default healingLoopEngine;
