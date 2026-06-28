export interface FailureAnalysis {
  rootCause: string;
  possibleFix: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  relatedModules: string[];
}

export class FailureAnalyzer {
  public analyzeFailure(testName: string, errorMessage: string): FailureAnalysis {
    let rootCause = `Test '${testName}' failed due to error: ${errorMessage}`;
    let possibleFix = 'Verify mock interfaces conform to correct typing rules.';
    let riskLevel: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    let relatedModules: string[] = ['CoreEngine'];

    if (testName.toLowerCase().includes('auth')) {
      rootCause = 'Null JWT token rejected during validation gateway checkpoint.';
      possibleFix = 'Ensure JWT payload properties are mapped inside the TestRequest configuration.';
      riskLevel = 'high';
      relatedModules = ['AuthenticationService', 'UserSessionManager'];
    }

    return {
      rootCause,
      possibleFix,
      riskLevel,
      relatedModules
    };
  }
}

export const failureAnalyzer = new FailureAnalyzer();
export default failureAnalyzer;
