import type { PatchDraft } from './AutonomousCodeGenerator';

export interface SecurityReview {
  hasInjectionRisk: boolean;
  hasHardcodedSecrets: boolean;
  hasUnsafeAPIs: boolean;
  warnings: string[];
}

export class SecurityReviewEngine {
  public reviewSecurity(draft: PatchDraft): SecurityReview {
    const code = draft.patchContent || '';
    const warnings: string[] = [];

    const hasInjectionRisk = code.includes('eval(') || code.includes('exec(');
    const hasHardcodedSecrets = code.includes('secret') || code.includes('password =') || code.includes('key =');
    const hasUnsafeAPIs = code.includes('localStorage') && draft.targetFile.includes('core');

    if (hasInjectionRisk) warnings.push('Critical: Unsafe eval() or exec() usage.');
    if (hasHardcodedSecrets) warnings.push('Critical: Possible credential leak in variable assignments.');
    if (hasUnsafeAPIs) warnings.push('Warning: Avoid native localStorage direct access inside core backend modules.');

    return {
      hasInjectionRisk,
      hasHardcodedSecrets,
      hasUnsafeAPIs,
      warnings
    };
  }
}

export const securityReviewEngine = new SecurityReviewEngine();
export default securityReviewEngine;
