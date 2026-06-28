import { projectHealthEngine } from './ProjectHealthEngine';
import { integrityScanner } from './IntegrityScanner';

export class QualityGate {
  public checkGate(): { passed: boolean; reason?: string } {
    const health = projectHealthEngine.calculateHealth();
    if (health.healthScore < 90) {
      return { passed: false, reason: `Project health score is too low: ${health.healthScore}% (Required: >= 90%)` };
    }

    const integrity = integrityScanner.scanProject();
    if (integrity.score < 90) {
      return { passed: false, reason: `Project integrity verification failed: Score = ${integrity.score}%` };
    }

    if (health.buildStatus !== 'success') {
      return { passed: false, reason: 'Build status check failed.' };
    }

    if (health.testPassRate < 100) {
      return { passed: false, reason: 'Unit tests check failed.' };
    }

    return { passed: true };
  }
}
export const qualityGate = new QualityGate();
export default qualityGate;
