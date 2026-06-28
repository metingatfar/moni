// ===================================================================
// MONI Sprint 6.8 — ComplianceAuditEngine.ts
// Continuously monitors the system state to ensure alignment with compliance frameworks.
// ===================================================================

export interface ComplianceAuditRequest {
  workflowId: string;
  dataAccessed: string[]; // e.g. ['email', 'password', 'user_id']
  dataLocation: string; // e.g. 'US-East', 'EU-West'
  encryptionActive: boolean;
}

export interface ComplianceAuditResult {
  workflowId: string;
  compliant: boolean;
  frameworkEvaluations: Record<string, boolean>;
  violations: string[];
  auditedAt: string;
}

export class ComplianceAuditEngine {
  private auditHistory: ComplianceAuditResult[] = [];

  auditWorkflow(request: ComplianceAuditRequest): ComplianceAuditResult {
    const violations: string[] = [];
    const frameworks = { SOC2: true, GDPR: true, HIPAA: true };

    // SOC2 Checks
    if (!request.encryptionActive) {
      frameworks.SOC2 = false;
      frameworks.HIPAA = false;
      violations.push('SOC2/HIPAA: Encryption at rest/transit is required.');
    }

    // GDPR Checks
    const hasPII = request.dataAccessed.includes('email') || request.dataAccessed.includes('ssn') || request.dataAccessed.includes('health_records');
    if (hasPII && request.dataLocation !== 'EU-West' && request.dataLocation !== 'EU-Central') {
      frameworks.GDPR = false;
      violations.push('GDPR: PII data must reside in EU region.');
    }

    // HIPAA Checks
    if (request.dataAccessed.includes('health_records') && !request.encryptionActive) {
      frameworks.HIPAA = false;
      violations.push('HIPAA: Health records must be strictly encrypted.');
    }

    const compliant = frameworks.SOC2 && frameworks.GDPR && frameworks.HIPAA;

    const result: ComplianceAuditResult = {
      workflowId: request.workflowId,
      compliant,
      frameworkEvaluations: frameworks,
      violations,
      auditedAt: new Date().toISOString()
    };

    this.auditHistory.push(result);
    return result;
  }

  getHistory(): ComplianceAuditResult[] {
    return [...this.auditHistory];
  }

  getMetrics(): any {
    const total = this.auditHistory.length;
    const compliant = this.auditHistory.filter(h => h.compliant).length;
    
    return {
      totalAudits: total,
      fullyCompliantWorkflows: compliant,
      complianceRate: total > 0 ? (compliant / total) * 100 : 100
    };
  }
}
