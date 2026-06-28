export interface DeveloperReview {
  agentName: string;
  confidence: number;
  apisCount: number;
  vulnerabilitiesFound: string[];
  findings: string[];
}

export class BackendDeveloperAgent {
  public reviewBackend(blueprint: any): DeveloperReview {
    const findings: string[] = [];
    const vulnerabilitiesFound: string[] = [];

    const apis = blueprint?.apis || [];
    findings.push(`Analyzed ${apis.length} API routes configuration.`);

    const hasAuth = apis.some((route: string) => route.toLowerCase().includes('auth') || route.toLowerCase().includes('login'));
    if (!hasAuth) {
      vulnerabilitiesFound.push('No authentication routes registered in blueprint.');
    }

    const hasSensitiveData = apis.some((route: string) => route.toLowerCase().includes('password') || route.toLowerCase().includes('secret'));
    if (hasSensitiveData) {
      vulnerabilitiesFound.push('Sensitive variables path exposed directly in API routes.');
    }

    return {
      agentName: 'BackendDeveloperAgent',
      confidence: 0.90,
      apisCount: apis.length,
      vulnerabilitiesFound,
      findings
    };
  }
}
