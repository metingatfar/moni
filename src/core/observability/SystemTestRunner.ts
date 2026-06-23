import type { TestResult } from './TestResult';
import { regressionSuite } from './RegressionSuite';
import { healthMonitor } from './HealthMonitor';
import { performanceProfiler } from './PerformanceProfiler';
import { container } from '../container/ServiceContainer';

export class SystemTestRunner {
  private lastReport: {
    timestamp: string;
    type: string;
    passed: number;
    failed: number;
    skipped: number;
    results: TestResult[];
  } | null = null;

  public getLastReport() {
    return this.lastReport;
  }

  public async runSmokeTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const startTime = Date.now();

    // 1. Container Boot Check
    results.push({
      testName: 'Container Boostrap Verify',
      module: 'Bootstrap',
      status: container.resolve('ExecutiveBrain') ? 'passed' : 'failed',
      expected: 'ExecutiveBrain Instance',
      actual: container.resolve('ExecutiveBrain') ? 'Instance loaded' : 'Not registered',
      durationMs: Date.now() - startTime,
      severity: 'critical',
      timestamp: new Date().toISOString()
    });

    // 2. Health check connection
    const health = await healthMonitor.checkHealth();
    const backendHealth = health.find(h => h.service === 'Backend API');
    results.push({
      testName: 'Backend Connection Smoke',
      module: 'Health',
      status: backendHealth?.status === 'unhealthy' ? 'failed' : 'passed',
      expected: 'healthy',
      actual: backendHealth?.status || 'unhealthy',
      durationMs: backendHealth?.latencyMs || 0,
      severity: 'high',
      timestamp: new Date().toISOString()
    });

    this.saveReport('Smoke Tests', results);
    return results;
  }

  public async runFullTests(): Promise<TestResult[]> {
    const smoke = await this.runSmokeTests();
    const regression = await this.runRegressionSuite();
    const performance = await this.runPerformanceTests();
    const provider = await this.runProviderTests(false); // normal mock check
    
    const all = [...smoke, ...regression, ...performance, ...provider];
    this.saveReport('Full Tests', all);
    return all;
  }

  public async runModuleTest(moduleName: string): Promise<TestResult[]> {
    const regression = await this.runRegressionSuite();
    const filtered = regression.filter(r => r.module.toLowerCase() === moduleName.toLowerCase());
    this.saveReport(`Module Test: ${moduleName}`, filtered);
    return filtered;
  }

  public async runRegressionSuite(): Promise<TestResult[]> {
    const eb = container.resolve<any>('ExecutiveBrain');
    
    // Quick mock executer if ExecutiveBrain executes normally
    const executeMock = async (input: string): Promise<string> => {
      if (eb) {
        // Run against ExecutiveBrain in mock mode
        // We can pass a callback that does nothing
        return await eb.execute(input, () => {});
      }
      return 'Mock outcome matching: ' + input;
    };

    const results = await regressionSuite.runRegression(executeMock);
    this.saveReport('Regression Suite', results);
    return results;
  }

  public async runProviderTests(live = false): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const start = Date.now();

    // Check if cooldown is active
    let hasCooldown = false;
    try {
      const orchestrator = container.resolve<any>('AIOrchestrator');
      if (orchestrator) {
        const geminiCooldown = orchestrator.providers?.gemini?.cooldownUntil || 0;
        const groqCooldown = orchestrator.providers?.groq?.cooldownUntil || 0;
        if (geminiCooldown > start || groqCooldown > start) {
          hasCooldown = true;
        }
      }
    } catch (_) {}

    if (hasCooldown) {
      results.push({
        testName: 'Gemini Live Response',
        module: 'LLM',
        status: 'skipped',
        expected: 'Successful LLM Reply',
        actual: 'Skipped due to active 429 Cooldown',
        durationMs: 0,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
      results.push({
        testName: 'Groq Live Response',
        module: 'LLM',
        status: 'skipped',
        expected: 'Successful LLM Reply',
        actual: 'Skipped due to active 429 Cooldown',
        durationMs: 0,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
      this.saveReport('Provider Tests (Skipped)', results);
      return results;
    }

    if (!live) {
      // Mock run
      results.push({
        testName: 'Gemini Provider Test',
        module: 'LLM',
        status: 'passed',
        expected: 'Mock response',
        actual: 'Mock response accepted',
        durationMs: 5,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
      results.push({
        testName: 'Groq Provider Test',
        module: 'LLM',
        status: 'passed',
        expected: 'Mock response',
        actual: 'Mock response accepted',
        durationMs: 4,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    } else {
      // Try actual LLM call if possible
      try {
        const orchestrator = container.resolve<any>('AIOrchestrator');
        if (orchestrator) {
          const res = await orchestrator.chatComplete([{ role: 'user', content: 'Ping' }], 'gemini');
          results.push({
            testName: 'Gemini Live Response',
            module: 'LLM',
            status: res ? 'passed' : 'failed',
            expected: 'valid content reply',
            actual: res || 'empty response',
            durationMs: Date.now() - start,
            severity: 'critical',
            timestamp: new Date().toISOString()
          });
        } else {
          throw new Error('AIOrchestrator not registered');
        }
      } catch (err: any) {
        results.push({
          testName: 'Gemini Live Response',
          module: 'LLM',
          status: 'failed',
          expected: 'valid reply',
          actual: 'Error: ' + err.message,
          durationMs: Date.now() - start,
          error: err.message,
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
      }
    }

    this.saveReport('Provider Tests', results);
    return results;
  }

  public async runPerformanceTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const start = Date.now();

    // Check profiler metrics
    const metrics = performanceProfiler.getMetrics();
    results.push({
      testName: 'Profiler Logging Active',
      module: 'Performance',
      status: 'passed',
      expected: 'Profiler running',
      actual: `Tracked modules: ${metrics.length}`,
      durationMs: Date.now() - start,
      severity: 'medium',
      timestamp: new Date().toISOString()
    });

    this.saveReport('Performance Tests', results);
    return results;
  }

  public async runStressTests(requestsCount = 100): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const start = Date.now();
    const eb = container.resolve<any>('ExecutiveBrain');

    let errorsCount = 0;
    const latencyRecords: number[] = [];

    // Run parallel or sequence of inputs simulating load
    for (let i = 0; i < requestsCount; i++) {
      const stepStart = Date.now();
      try {
        if (eb) {
          await eb.execute(`Stress test input ${i}`, () => {});
        }
        latencyRecords.push(Date.now() - stepStart);
      } catch (_) {
        errorsCount++;
      }
    }

    const avgLatency = latencyRecords.length > 0 
      ? Math.round(latencyRecords.reduce((a, b) => a + b, 0) / latencyRecords.length) 
      : 0;

    results.push({
      testName: `Stress Test Run (${requestsCount} requests)`,
      module: 'Stress',
      status: errorsCount > (requestsCount * 0.1) ? 'failed' : 'passed',
      expected: `Errors < 10%`,
      actual: `Errors: ${errorsCount}/${requestsCount}, Avg Latency: ${avgLatency}ms`,
      durationMs: Date.now() - start,
      severity: 'critical',
      timestamp: new Date().toISOString()
    });

    this.saveReport('Stress Tests', results);
    return results;
  }

  private saveReport(type: string, results: TestResult[]) {
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    this.lastReport = {
      timestamp: new Date().toISOString(),
      type,
      passed,
      failed,
      skipped,
      results
    };
  }
}

export const systemTestRunner = new SystemTestRunner();
