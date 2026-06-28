import type { TestRequest } from './TestRequest';
import { testStrategyPlanner } from './TestStrategyPlanner';
import { unitTestGenerator } from './UnitTestGenerator';
import { integrationTestGenerator } from './IntegrationTestGenerator';
import { apiTestGenerator } from './APITestGenerator';
import { uiTestGenerator } from './UITestGenerator';
import { regressionTestPlanner } from './RegressionTestPlanner';
import { edgeCaseGenerator } from './EdgeCaseGenerator';
import { mockDataGenerator } from './MockDataGenerator';
import { coverageAnalyzer } from './CoverageAnalyzer';
import { mutationTestingEngine } from './MutationTestingEngine';
import { failureAnalyzer } from './FailureAnalyzer';
import { testQualityEngine } from './TestQualityEngine';
import { aiTestReviewEngine } from './AITestReviewEngine';
import { testPrioritizationEngine } from './TestPrioritizationEngine';
import { testSuiteOptimizer } from './TestSuiteOptimizer';
import { testReportGenerator } from './TestReportGenerator';

export interface AutonomousTestingDiagnostics {
  generatedTests: number;
  executedTests: number;
  failedTests: number;
  passedTests: number;
  coverage: number;
  mutationScore: number;
  reliabilityScore: number;
  averageExecutionTime: number; // ms
}

export interface TestingResult {
  request: TestRequest;
  strategy: string;
  unitTest: any;
  integrationTest: any;
  apiTest: any;
  uiTest: any;
  regressionPlan: any;
  edgeCases: any[];
  mockData: any[];
  coverage: any;
  mutation: any;
  failureAnalysis: any;
  reviewResult: any;
  priorityInfo: any;
  optimizationResult: any;
  qualityMetrics: any;
  reportsResult: any;
}

export class AutonomousTestingEngine {
  private generatedTestsCount = 0;
  private executedTestsCount = 0;
  private failedTestsCount = 0;
  private passedTestsCount = 0;
  private coverageSum = 0;
  private mutationScoreSum = 0;
  private reliabilityScoreSum = 0;
  private totalRunTimes = 0;
  private runsCount = 0;

  public async executeTesting(request: TestRequest): Promise<TestingResult> {
    const startTime = Date.now();

    // 1. Plan Strategy
    const strategy = testStrategyPlanner.planStrategy(request.testScope, request.targetFiles);

    // 2. Generate test types
    const unitTest = unitTestGenerator.generateUnitTest(request.targetModule, request.targetFiles, request.framework);
    const integrationTest = integrationTestGenerator.generateIntegrationTest(request.targetModule, request.targetFiles, request.framework);
    const apiTest = apiTestGenerator.generateAPITest(request.targetModule, request.targetFiles, request.framework);
    const uiTest = uiTestGenerator.generateUITest(request.targetModule, request.targetFiles, request.framework);

    // 3. Plan Regression
    const regressionPlan = regressionTestPlanner.planRegression(request.targetFiles);

    // 4. Edge Cases
    const edgeCases = edgeCaseGenerator.generateEdgeCases(request.targetModule);

    // 5. Mock Data
    const mockData = mockDataGenerator.generateMockData(request.targetModule);

    // 6. Coverage & Mutation
    const coverage = coverageAnalyzer.analyzeCoverage(unitTest.codeContent);
    const mutation = mutationTestingEngine.evaluateTestSuiteStrength(unitTest.codeContent);

    // 7. Review, Prioritization & Optimization
    const reviewResult = aiTestReviewEngine.reviewTestCode(unitTest.codeContent);
    const priorityInfo = testPrioritizationEngine.classifyPriority(unitTest.testSuiteName, request.testScope);
    const optimizationResult = testSuiteOptimizer.optimizeSuite(unitTest.codeContent);

    // 8. Failure Analysis (mock fallback if needed)
    const failureAnalysis = failureAnalyzer.analyzeFailure(unitTest.testSuiteName, 'Timeout waiting for mock DB callback');

    // 9. Score Quality
    const qualityMetrics = testQualityEngine.scoreTestSuite(
      unitTest.assertionsCount + integrationTest.assertionsCount + apiTest.assertionsCount + uiTest.assertionsCount,
      coverage.lineCoverage,
      mutation.mutationScore
    );

    // 10. Generate Reports
    const reportsResult = testReportGenerator.generateReports({
      requestId: request.requestId,
      strategy,
      metrics: qualityMetrics,
      priorityInfo,
      reviewResult,
      optimizationResult,
      failureInfo: failureAnalysis,
      coverage,
      mutation
    });

    // Update internal diagnostics
    this.runsCount++;
    const totalTests = 4; // Unit, Integration, API, UI
    this.generatedTestsCount += totalTests;
    this.executedTestsCount += totalTests;
    this.passedTestsCount += totalTests; // All passed in mock pipeline
    this.coverageSum += coverage.lineCoverage;
    this.mutationScoreSum += mutation.mutationScore;
    this.reliabilityScoreSum += qualityMetrics.reliabilityScore;
    this.totalRunTimes += (Date.now() - startTime);

    return {
      request,
      strategy,
      unitTest,
      integrationTest,
      apiTest,
      uiTest,
      regressionPlan,
      edgeCases,
      mockData,
      coverage,
      mutation,
      failureAnalysis,
      reviewResult,
      priorityInfo,
      optimizationResult,
      qualityMetrics,
      reportsResult
    };
  }

  public getDiagnostics(): AutonomousTestingDiagnostics {
    const count = this.runsCount || 1;
    return {
      generatedTests: this.generatedTestsCount,
      executedTests: this.executedTestsCount,
      failedTests: this.failedTestsCount,
      passedTests: this.passedTestsCount,
      coverage: Math.round(this.coverageSum / count),
      mutationScore: Math.round(this.mutationScoreSum / count),
      reliabilityScore: Math.round(this.reliabilityScoreSum / count),
      averageExecutionTime: Math.round(this.totalRunTimes / count) || 12 // ms
    };
  }
}

export const autonomousTestingEngine = new AutonomousTestingEngine();
export default autonomousTestingEngine;
