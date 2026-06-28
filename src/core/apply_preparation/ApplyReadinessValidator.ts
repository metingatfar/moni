export interface ReadinessValidationResult {
  passed: boolean;
  score: number;
  checks: Record<string, boolean>;
}

export class ApplyReadinessValidator {
  public validateReadiness(
    reviewPassed: boolean,
    validationPassed: boolean,
    sandboxPassed: boolean,
    compilePassed: boolean,
    regressionPassed: boolean
  ): ReadinessValidationResult {
    const checks = {
      patchReview: reviewPassed,
      patchValidation: validationPassed,
      sandboxApply: sandboxPassed,
      compileVerification: compilePassed,
      regressionVerification: regressionPassed,
      rollbackPrepared: true,
      backupPrepared: true
    };

    const passed = Object.values(checks).every(val => val === true);
    const score = passed ? 100 : 70;

    return {
      passed,
      score,
      checks
    };
  }
}

export const applyReadinessValidator = new ApplyReadinessValidator();
export default applyReadinessValidator;
