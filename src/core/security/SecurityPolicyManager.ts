// ===================================================================
// MONI Sprint 6.8 — SecurityPolicyManager.ts
// Centralized definition and enforcement of enterprise security policies.
// ===================================================================

export interface SecurityPolicy {
  policyId: string;
  name: string;
  frameworks: string[]; // e.g., 'SOC2', 'GDPR', 'HIPAA'
  rules: PolicyRule[];
  enforcementMode: 'block' | 'warn' | 'audit';
}

export interface PolicyRule {
  ruleId: string;
  description: string;
  target: 'code' | 'command' | 'workflow' | 'plugin';
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PolicyEvaluationResult {
  passed: boolean;
  violations: PolicyViolation[];
  frameworkCoverage: Record<string, number>;
  evaluatedAt: string;
}

export interface PolicyViolation {
  policyId: string;
  ruleId: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: string;
}

const DEFAULT_POLICIES: SecurityPolicy[] = [
  {
    policyId: 'pol-soc2-baseline',
    name: 'SOC2 Baseline Security',
    frameworks: ['SOC2'],
    enforcementMode: 'block',
    rules: [
      { ruleId: 'r-soc2-01', description: 'Prevent hardcoded secrets', target: 'code', condition: 'no-secrets', severity: 'critical' },
      { ruleId: 'r-soc2-02', description: 'Enforce principle of least privilege', target: 'workflow', condition: 'least-privilege', severity: 'high' },
      { ruleId: 'r-soc2-03', description: 'Audit all access modifications', target: 'plugin', condition: 'audit-access', severity: 'high' },
    ],
  },
  {
    policyId: 'pol-gdpr-privacy',
    name: 'GDPR Privacy Controls',
    frameworks: ['GDPR'],
    enforcementMode: 'block',
    rules: [
      { ruleId: 'r-gdpr-01', description: 'Anonymize PII in logs', target: 'workflow', condition: 'anonymize-pii', severity: 'critical' },
      { ruleId: 'r-gdpr-02', description: 'Data residency constraint', target: 'command', condition: 'eu-only-transfer', severity: 'high' },
    ],
  },
  {
    policyId: 'pol-code-safety',
    name: 'Code Execution Safety',
    frameworks: ['Internal', 'SOC2'],
    enforcementMode: 'block',
    rules: [
      { ruleId: 'r-code-01', description: 'Block eval() usage', target: 'code', condition: 'no-eval', severity: 'critical' },
      { ruleId: 'r-code-02', description: 'Require input sanitization', target: 'code', condition: 'sanitize-input', severity: 'high' },
      { ruleId: 'r-code-03', description: 'Enforce HTTPS', target: 'code', condition: 'require-https', severity: 'medium' },
    ],
  }
];

export class SecurityPolicyManager {
  private activePolicies: Map<string, SecurityPolicy> = new Map();
  private evaluationHistory: PolicyEvaluationResult[] = [];

  constructor() {
    // Load defaults
    DEFAULT_POLICIES.forEach(p => this.activePolicies.set(p.policyId, p));
  }

  getPolicies(): SecurityPolicy[] {
    return Array.from(this.activePolicies.values());
  }

  addPolicy(policy: SecurityPolicy): void {
    this.activePolicies.set(policy.policyId, policy);
  }

  evaluateCode(codeContent: string): PolicyEvaluationResult {
    const violations: PolicyViolation[] = [];
    const lowerCode = codeContent.toLowerCase();

    for (const policy of this.activePolicies.values()) {
      if (policy.enforcementMode === 'audit') continue;

      for (const rule of policy.rules.filter(r => r.target === 'code')) {
        let isViolated = false;
        
        if (rule.condition === 'no-eval' && lowerCode.includes('eval(')) isViolated = true;
        if (rule.condition === 'require-https' && lowerCode.includes('http://')) isViolated = true;
        if (rule.condition === 'no-secrets' && (lowerCode.includes('api_key=') || lowerCode.includes('password='))) isViolated = true;

        if (isViolated) {
          violations.push({
            policyId: policy.policyId,
            ruleId: rule.ruleId,
            description: rule.description,
            severity: rule.severity,
            context: 'Code AST Analysis',
          });
        }
      }
    }

    return this.recordResult(violations);
  }

  evaluateWorkflow(workflowContext: any): PolicyEvaluationResult {
    const violations: PolicyViolation[] = [];
    
    // Simulate workflow policy checks
    const strContext = JSON.stringify(workflowContext).toLowerCase();
    
    for (const policy of this.activePolicies.values()) {
      for (const rule of policy.rules.filter(r => r.target === 'workflow')) {
        let isViolated = false;
        if (rule.condition === 'anonymize-pii' && strContext.includes('email') && !strContext.includes('hash')) isViolated = true;
        if (rule.condition === 'least-privilege' && strContext.includes('admin') && !strContext.includes('sudo')) isViolated = true; // simulated condition

        if (isViolated) {
          violations.push({
            policyId: policy.policyId,
            ruleId: rule.ruleId,
            description: rule.description,
            severity: rule.severity,
            context: 'Workflow Context Analysis',
          });
        }
      }
    }

    return this.recordResult(violations);
  }

  getEvaluationHistory(): PolicyEvaluationResult[] {
    return [...this.evaluationHistory];
  }

  getMetrics(): any {
    const total = this.evaluationHistory.length;
    const failed = this.evaluationHistory.filter(h => !h.passed).length;
    const violations = this.evaluationHistory.reduce((s, h) => s + h.violations.length, 0);

    return {
      activePoliciesCount: this.activePolicies.size,
      totalEvaluations: total,
      failedEvaluations: failed,
      totalViolations: violations,
      passRate: total > 0 ? ((total - failed) / total) * 100 : 100
    };
  }

  private recordResult(violations: PolicyViolation[]): PolicyEvaluationResult {
    const result: PolicyEvaluationResult = {
      passed: violations.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0,
      violations,
      frameworkCoverage: this.calculateCoverage(),
      evaluatedAt: new Date().toISOString(),
    };
    this.evaluationHistory.push(result);
    return result;
  }

  private calculateCoverage(): Record<string, number> {
    const coverage: Record<string, number> = {};
    for (const p of this.activePolicies.values()) {
      for (const f of p.frameworks) {
        coverage[f] = (coverage[f] || 0) + p.rules.length;
      }
    }
    // Normalize to percentage simulation
    Object.keys(coverage).forEach(k => coverage[k] = Math.min(100, coverage[k] * 10));
    return coverage;
  }
}
