export interface PolicyValidationResult {
  allowed: boolean;
  reason?: string;
}

export interface SecurityValidationResult {
  safe: boolean;
  warnings: string[];
}

export interface CommandValidationResult {
  valid: boolean;
  reason?: string;
}

export interface PolicyViolation {
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
}

export class ExecutionPolicyEngine {
  private violationsList: PolicyViolation[] = [];

  public validatePermissions(operation: string, targetPath: string): PolicyValidationResult {
    // Prevent operations outside workspace
    const lowerPath = targetPath.toLowerCase();
    if (lowerPath.includes('c:/windows') || lowerPath.includes('/etc/') || lowerPath.includes('/usr/')) {
      const violation: PolicyViolation = {
        ruleId: 'SEC-PERM-OUTSIDE-WORKSPACE',
        severity: 'critical',
        message: `Attempted operation '${operation}' on protected path: ${targetPath}`,
        timestamp: Date.now()
      };
      this.violationsList.push(violation);
      return {
        allowed: false,
        reason: `Operation '${operation}' on protected system paths is forbidden.`
      };
    }

    return { allowed: true };
  }

  public checkSecurityRules(content: string): SecurityValidationResult {
    const warnings: string[] = [];
    let safe = true;

    // Detect hardcoded credentials
    const secretPatterns = [
      /api[_-]?key/i,
      /secret/i,
      /password/i,
      /private[_-]?key/i
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(content) && content.includes('=')) {
        warnings.push(`Potential secret keyword matching ${pattern.toString()} detected.`);
        safe = false;
      }
    }

    if (!safe) {
      this.violationsList.push({
        ruleId: 'SEC-CONTENT-SECRET-LEAK',
        severity: 'high',
        message: `Secret keywords detected in content matching: ${warnings.join(', ')}`,
        timestamp: Date.now()
      });
    }

    return { safe, warnings };
  }

  public checkForbiddenOperations(cmd: string): CommandValidationResult {
    const forbidden = [
      'rm -rf /',
      'rm -rf *',
      'format',
      'chmod -r',
      ':(){ :|:& };:'
    ];

    for (const pattern of forbidden) {
      if (cmd.includes(pattern)) {
        this.violationsList.push({
          ruleId: 'SEC-CMD-FORBIDDEN',
          severity: 'critical',
          message: `Attempted forbidden command pattern: ${pattern}`,
          timestamp: Date.now()
        });
        return {
          valid: false,
          reason: `Command includes forbidden operation pattern: ${pattern}`
        };
      }
    }

    return { valid: true };
  }

  public getViolations(): PolicyViolation[] {
    return this.violationsList;
  }
}
