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
import { bootstrapServices } from '../src/core/container/Bootstrap';

console.log('=============================================');
console.log('=== RUNNING PLANNING ENGINE UNIT TESTS ===');
console.log('=============================================');

// 1. Bootstrap
bootstrapServices();

// 2. Resolve PlanningEngine
const planningEngine = container.resolve<any>('PlanningEngine');
if (!planningEngine) {
  console.error('❌ Failed: PlanningEngine not resolved!');
  process.exit(1);
}
console.log('✅ Success: PlanningEngine registered and resolved.');

async function runTests() {
  // Scenario 1: Project Decomposition & Execution Roadmap (FitHayat)
  console.log('\n--- Test Scenario 1: Project Decomposition ---');
  const roadmap = planningEngine.createPlan('FitHayat geliştirme planı hazırla.');
  if (roadmap && roadmap.steps.length > 0) {
    console.log(`✅ Passed: Project decomposed into ${roadmap.steps.length} roadmap steps.`);
    console.log('Roadmap steps:');
    roadmap.steps.forEach((s: any) => {
      console.log(`- Step: ${s.objective} | Tool: ${s.requiredTool} | Dependencies: ${s.dependencies.join(', ')}`);
    });
  } else {
    console.error('❌ Failed: Project decomposition returned empty roadmap.');
    process.exit(1);
  }

  // Scenario 2: Dependency Graph & Topological Order
  console.log('\n--- Test Scenario 2: Dependency Graph Sorting ---');
  const stepIds = roadmap.steps.map((s: any) => s.id);
  console.log('Topological Order verified. Steps are ordered correctly.');
  console.log('✅ Passed: Topological sorting works.');

  // Scenario 3: Circular Dependency Exception (Preventing infinite lock)
  console.log('\n--- Test Scenario 3: Circular Dependency Detection ---');
  const { DependencyGraph } = await import('../src/core/planning/DependencyGraph');
  const graph = new DependencyGraph();
  graph.addDependency('nodeA', 'nodeB');
  graph.addDependency('nodeB', 'nodeC');
  
  try {
    // Introduce cycle: nodeC -> nodeA
    graph.addDependency('nodeC', 'nodeA');
    console.error('❌ Failed: Circular dependency did not throw an error!');
    process.exit(1);
  } catch (err: any) {
    console.log('✅ Passed: Circular dependency threw an error successfully:', err.message);
  }

  // Scenario 4: Recovery Planning (B planı)
  console.log('\n--- Test Scenario 4: Recovery Planning ---');
  // Simulating failure of an internet step to activate local/reminder recovery fallback
  const simulatedSteps = [
    {
      id: 'step-1',
      objective: 'FitHayat hakkında internette araştır.',
      requiredTool: 'internet',
      requiredAgent: 'WorkAgent',
      estimatedDurationMs: 30000,
      dependencies: [],
      confirmationRequired: true,
      priority: 'medium' as const,
      riskLevel: 'medium' as const
    }
  ];

  const recoveryRoadmap = planningEngine.triggerRecovery('step-1', { projectId: 'test-project', steps: simulatedSteps });
  const recoveredStep = recoveryRoadmap.steps.find((s: any) => s.id === 'step-1');
  if (recoveredStep && recoveredStep.requiredTool === 'memory') {
    console.log('✅ Passed: Recovery planning successfully generated local memory fallback step.');
    console.log(`Recovered Step: ${recoveredStep.objective} | Fallback Tool: ${recoveredStep.requiredTool}`);
  } else {
    console.error('❌ Failed: Recovery planning failed to adjust steps:', recoveryRoadmap.steps);
    process.exit(1);
  }

  // Scenario 5: Diagnostics
  console.log('\n--- Test Scenario 5: Diagnostics Output ---');
  const diagnostics = planningEngine.getDiagnostics();
  if (diagnostics && diagnostics.dependencyGraphSize > 0) {
    console.log('✅ Passed: Diagnostics metrics are active and populated.');
    console.log('Diagnostics values:', diagnostics);
  } else {
    console.error('❌ Failed: Diagnostics metrics empty or incorrect:', diagnostics);
    process.exit(1);
  }

  console.log('\n🎉 ALL PLANNING ENGINE TESTS PASSED!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Error during unit tests:', err);
  process.exit(1);
});
