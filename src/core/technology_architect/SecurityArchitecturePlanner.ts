import type { ProjectRequirements } from './RequirementAnalyzer';
import type { DecisionOutcome } from './LanguageSelector';

export class SecurityArchitecturePlanner {
  public planSecurity(requirements: ProjectRequirements): DecisionOutcome {
    const reasons: string[] = [];
    let sec = 'JWT Auth + HTTPS + Rate Limiting';
    let confidence = 85;

    if (requirements.complianceConstraints.includes('PCI-DSS') || requirements.complianceConstraints.includes('HIPAA')) {
      sec = 'OAuth2 / OpenID Connect + RBAC + Column Encryption';
      confidence = 92;
      reasons.push('OAuth2 delegates credential security checks to verified authentication servers.', 'Column-level encryption keeps sensitive records secure even if DB is compromised.');
    } else {
      reasons.push('JWT token sessions are stateless, keeping servers scale-friendly.', 'Rate-limiting prevents brute-force login attempts.');
    }

    return {
      selection: sec,
      confidenceScore: confidence,
      reasoning: reasons
    };
  }
}
