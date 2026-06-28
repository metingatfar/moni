export class TestingPlanner {
  public planTesting(userInput: string, framework: string): { framework: string; testSuites: string[]; coverageTargetPercent: number } {
    let testFramework = 'Jest';
    const fw = framework.toLowerCase();

    if (fw === 'flutter') {
      testFramework = 'Flutter Test';
    } else if (fw === 'fastapi') {
      testFramework = 'PyTest';
    }

    const testSuites = [
      'src/tests/unit/AuthenticationService.test.ts',
      'src/tests/unit/UserProfileController.test.ts',
      'src/tests/integration/AuthWorkflowFlow.test.ts',
      'src/tests/e2e/UserDashboardScenarios.test.ts'
    ];

    if (userInput.toLowerCase().includes('fitness')) {
      testSuites.push('src/tests/unit/WorkoutTracker.test.ts');
    }

    return {
      framework: testFramework,
      testSuites,
      coverageTargetPercent: 85
    };
  }
}
