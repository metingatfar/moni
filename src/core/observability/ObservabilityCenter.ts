import { systemTestRunner } from './SystemTestRunner';
import { pipelineTracer } from './PipelineTracer';
import { traceLogger } from './TraceLogger';
import { performanceProfiler } from './PerformanceProfiler';
import { healthMonitor } from './HealthMonitor';
import { container } from '../container/ServiceContainer';

export class ObservabilityCenter {
  public async runAll() {
    return await systemTestRunner.runFullTests();
  }

  public async runSmoke() {
    return await systemTestRunner.runSmokeTests();
  }

  public async runRegression() {
    return await systemTestRunner.runRegressionSuite();
  }

  public async runPerformance() {
    return await systemTestRunner.runPerformanceTests();
  }

  public async runHealth() {
    return await healthMonitor.checkHealth();
  }

  public async getTrace() {
    return pipelineTracer.getCurrentTrace();
  }

  public getTraceLogs() {
    return traceLogger.getTraces();
  }

  public clearLogs() {
    traceLogger.clearLogs();
    performanceProfiler.resetMetrics();
  }

  public async getDashboard() {
    const health = await healthMonitor.checkHealth();
    const metrics = performanceProfiler.getMetrics();
    const traces = traceLogger.getTraces();
    const lastTrace = traces[0] || null;

    // Resolve details from LearningEngine & container counts
    let tokenRemaining = 100000;
    let budgetMode = 'Normal';
    let cacheHitRate = 0;
    let workflowsCount = 0;
    let goalsCount = 0;
    let memoryCount = 0;
    let conversationsCount = 0;
    let lifeScore = 85;
    let intelligenceScore = 95;

    try {
      const learning = container.resolve<any>('LearningEngine');
      if (learning) {
        const diag = learning.getDiagnostics();
        tokenRemaining = diag.tokenRemaining;
        budgetMode = diag.costMode;
        cacheHitRate = diag.cacheHitRate;
      }
    } catch (_) {}

    try {
      const goals = container.resolve<any>('GoalEngine');
      if (goals) {
        goalsCount = goals.getGoals().length;
      }
    } catch (_) {}

    try {
      const workflows = container.resolve<any>('WorkflowEngine');
      if (workflows) {
        workflowsCount = workflows.getWorkflows().length;
      }
    } catch (_) {}

    try {
      const memory = container.resolve<any>('LongTermMemory');
      if (memory) {
        memoryCount = memory.getFacts().length;
      }
    } catch (_) {}

    try {
      const conv = container.resolve<any>('ConversationEngine');
      if (conv) {
        conversationsCount = conv.history?.getMessages?.()?.length || 0;
      }
    } catch (_) {}

    const lastReport = systemTestRunner.getLastReport();
    let totalPassed = lastReport ? lastReport.passed : 0;
    let totalFailed = lastReport ? lastReport.failed : 0;
    let totalSkipped = lastReport ? lastReport.skipped : 0;

    // Calculate score
    const totalTests = totalPassed + totalFailed;
    const testScore = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 100;
    const healthScore = health.every(h => h.status !== 'unhealthy') ? 100 : 75;
    const overallScore = Math.round((testScore + healthScore) / 2);

    let slowest = performanceProfiler.getSlowestModule();
    let fastest = performanceProfiler.getFastestModule();
    let avgResponse = performanceProfiler.getAverageResponseTime();

    return {
      overallScore,
      smoke: {
        passed: totalPassed,
        failed: totalFailed,
        skipped: totalSkipped,
        lastRun: lastReport ? lastReport.timestamp : 'Never'
      },
      health,
      metrics,
      lastTrace,
      slowestModule: slowest,
      fastestModule: fastest,
      averageResponseTimeMs: avgResponse,
      tokenRemaining,
      budgetMode,
      cacheHitRate,
      workflowsCount,
      goalsCount,
      memoryCount,
      conversationsCount,
      lifeScore,
      intelligenceScore
    };
  }

  public getDiagnostics() {
    return {
      tracerActive: !!pipelineTracer.getCurrentTrace(),
      loggedTraces: traceLogger.getTraces().length,
      profilerActive: true
    };
  }
}

export const observabilityCenter = new ObservabilityCenter();
export default observabilityCenter;
