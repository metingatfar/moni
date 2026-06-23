/// <reference types="node" />

// Mock globals for test environment
const storage: Record<string, string> = {};
const g = globalThis as any;

g.localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, val: string) => { storage[key] = val; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { for (const k in storage) delete storage[k]; },
  length: 0,
  key: (index: number) => null
};

g.window = {
  dispatchEvent: () => {},
  SpeechRecognition: function() {},
  webkitSpeechRecognition: function() {},
  localStorage: g.localStorage
};

import { container } from '../src/core/container/ServiceContainer';

// Mock LongTermMemory
const mockLtm = {
  getFacts: () => [],
  addFact: async () => 'mock-id',
  deleteFact: async () => true,
  search: () => []
};
container.register('LongTermMemory', mockLtm);

import { bootstrapServices } from '../src/core/container/Bootstrap';
import { AutonomousExecutiveEngine } from '../src/core/executive/AutonomousExecutiveEngine';
import { ExecutiveStateManager } from '../src/core/executive/ExecutiveStateManager';
import { ExecutiveMonitor } from '../src/core/executive/ExecutiveMonitor';
import { ExecutivePolicyEngine } from '../src/core/executive/ExecutivePolicyEngine';
import { ExecutivePriorityManager } from '../src/core/executive/ExecutivePriorityManager';
import { ExecutiveResourceManager } from '../src/core/executive/ExecutiveResourceManager';
import { ExecutiveDecisionCoordinator } from '../src/core/executive/ExecutiveDecisionCoordinator';
import { ExecutiveSelfAssessment } from '../src/core/executive/ExecutiveSelfAssessment';
import { ExecutiveImprovementPlanner } from '../src/core/executive/ExecutiveImprovementPlanner';
import { ExecutiveTelemetry } from '../src/core/executive/ExecutiveTelemetry';

console.log('----------------------------------------------------');
console.log('RUNNING AUTONOMOUS EXECUTIVE ENGINE UNIT TESTS (MOCK)');
console.log('----------------------------------------------------');

// Bootstrap services so we can test resolution
bootstrapServices();

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  try {
    // Test 1: Service Container Resolution
    const aee = container.resolve<AutonomousExecutiveEngine>('AutonomousExecutiveEngine');
    assert(!!aee, 'AutonomousExecutiveEngine should resolve from container');

    // Test 2: ExecutiveStateManager
    const stateManager = new ExecutiveStateManager();
    const state1 = stateManager.getState();
    assert(state1.activeRequest === 'None', 'Initial request state should be None');
    stateManager.updateState({ activeGoal: 'FitHayat Geliştirme' });
    assert(stateManager.getState().activeGoal === 'FitHayat Geliştirme', 'State updates should apply correctly');

    // Test 3: ExecutiveMonitor
    const monitor = new ExecutiveMonitor();
    const statuses = monitor.checkHealth();
    assert(statuses.length === 10, 'Should monitor exactly 10 engines');
    assert(statuses.some(s => s.name === 'Reasoning'), 'Reasoning engine health should be checked');

    // Test 4: ExecutivePolicyEngine
    const policyEngine = new ExecutivePolicyEngine();
    assert(policyEngine.determinePolicy('Bugün çok yorgunum') === 'HealthPriority', 'Should detect health priority policy for tired input');
    assert(policyEngine.determinePolicy('FitHayat planı yap') === 'PlanningPriority', 'Should detect planning priority policy for plans/sprint inputs');
    assert(policyEngine.determinePolicy('Yarın borsa nasıl?') === 'InternetSuggested', 'Should detect internet suggested policy for news/market info');
    assert(policyEngine.determinePolicy('Normal soru') === 'Standard', 'Should return Standard policy default');

    // Test 5: ExecutivePriorityManager
    const priorityManager = new ExecutivePriorityManager();
    const standardPriority = priorityManager.getPriorities('Standard');
    assert(standardPriority[0] === 'Health' && standardPriority[1] === 'Critical', 'Standard priorities stack');
    const healthPriority = priorityManager.getPriorities('HealthPriority');
    assert(healthPriority[0] === 'Health', 'HealthPriority policy puts Health engine first');
    const planPriority = priorityManager.getPriorities('PlanningPriority');
    assert(planPriority[0] === 'Planning', 'PlanningPriority policy puts Planning engine first');

    // Test 6: ExecutiveResourceManager
    const resourceManager = new ExecutiveResourceManager();
    const initRes = resourceManager.getMetrics();
    assert(initRes.tokenRemaining === 100000, 'Initial token budget is 100000');
    resourceManager.recordTokenUsage(1500);
    assert(resourceManager.getMetrics().tokenRemaining === 98500, 'Tokens recorded correctly');

    // Test 7: ExecutiveDecisionCoordinator
    const coordinator = new ExecutiveDecisionCoordinator();
    const decisions = [
      { engineName: 'PlanningEngine', recommendedAction: 'create_plan', safetyScore: 85, confidence: 0.8 },
      { engineName: 'ToolIntelligenceEngine', recommendedAction: 'execute_tool', safetyScore: 95, confidence: 0.95 }
    ];
    const resolved = coordinator.resolveConflict(decisions);
    assert(resolved.engineName === 'ToolIntelligenceEngine', 'Coordinator picks engine with highest safetyScore');

    // Test 8: ExecutiveSelfAssessment
    const assessment = new ExecutiveSelfAssessment();
    const assess1 = assessment.assess('Normal input', 'Response content', 'none');
    assert(assess1.score === 95, 'Standard outcome score is 95');
    const assessNegative = assessment.assess('Failed input', 'Wrong response', 'dislike');
    assert(assessNegative.score === 60, 'Negative feedback drops self-assessment score to 60');

    // Test 9: ExecutiveImprovementPlanner
    const planner = new ExecutiveImprovementPlanner();
    const suggestions = planner.generateSuggestions({
      ReasoningEngine: 95,
      ToolIntelligenceEngine: 84
    });
    assert(suggestions.length === 1, 'Generates suggestions for engines scoring below 90');
    assert(suggestions[0].targetModule === 'ToolIntelligenceEngine', 'Targets degraded module');

    // Test 10: ExecutiveTelemetry
    const telemetry = new ExecutiveTelemetry();
    telemetry.recordExecution(120, 5);
    const metrics = telemetry.getMetrics();
    assert(metrics.totalExecutions === 1, 'Records executions count');
    assert(metrics.avgDecisionTimeMs === 120, 'Computes average decision latency');

    // Test 11: End-to-end Orchestration & Diagnostics
    const result = await aee.evaluateExecution('Bugün çok yorgunum');
    assert(result.policy === 'HealthPriority', 'Orchestrator resolves correct policy');
    assert(result.priorities[0] === 'Health', 'Orchestrator updates priorities stack');

    const diag = aee.getDiagnostics();
    assert(diag.currentPolicy === 'HealthPriority', 'Diagnostics reports current active policy');
    assert(diag.executiveDecisions > 0, 'Decisions count increments on diagnostics');

  } catch (err: any) {
    console.error('Test suite failed with error:', err);
    failed++;
  }

  console.log('----------------------------------------------------');
  console.log(`TEST RUN COMPLETED. Passed: ${passed}, Failed: ${failed}`);
  console.log('----------------------------------------------------');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
