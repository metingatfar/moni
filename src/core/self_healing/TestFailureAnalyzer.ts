export interface TestAuditResult {
  failureFound: boolean;
  failureDescription: string;
  remediationAction: string;
}

export class TestFailureAnalyzer {
  public analyzeTestFailure(testSuiteName: string, errorMessage: string): TestAuditResult {
    let failureDescription = '';
    let remediationAction = '';

    if (errorMessage.toLowerCase().includes('assert') || errorMessage.toLowerCase().includes('expect')) {
      failureDescription = `Assertion failed inside ${testSuiteName}.`;
      remediationAction = 'Update mock returns or logic structures to align with assertion expectations.';
    } else if (errorMessage.toLowerCase().includes('mock') || errorMessage.toLowerCase().includes('undefined')) {
      failureDescription = `Mock reference injection error in ${testSuiteName}.`;
      remediationAction = 'Validate mock injection setup inside beforeAll/beforeEach suite hooks.';
    } else {
      failureDescription = `General compilation crash inside ${testSuiteName}.`;
      remediationAction = 'Run compiler build syntax audits on target test file.';
    }

    return {
      failureFound: true,
      failureDescription,
      remediationAction
    };
  }
}
