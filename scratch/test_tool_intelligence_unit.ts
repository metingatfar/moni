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

console.log('==================================================');
console.log('=== RUNNING TOOL INTELLIGENCE ENGINE UNIT TESTS ===');
console.log('==================================================');

// 1. Bootstrap
bootstrapServices();

// 2. Resolve ToolIntelligenceEngine
const tiEngine = container.resolve<any>('ToolIntelligenceEngine');
if (!tiEngine) {
  console.error('❌ Failed: ToolIntelligenceEngine not resolved!');
  process.exit(1);
}
console.log('✅ Success: ToolIntelligenceEngine registered and resolved.');

async function runTests() {
  // Test A: Calendar selection
  console.log('\n--- Test Scenario 1: Calendar Selection ---');
  const plan1 = await tiEngine.planExecution('Yarın saat 10 toplantı oluştur.');
  if (plan1.steps.length === 1 && plan1.steps[0].tool === 'calendar') {
    console.log('✅ Passed: Selected calendar successfully.');
  } else {
    console.error('❌ Failed: Wrong plan generated:', plan1.steps);
    process.exit(1);
  }

  // Test B: Multi Tool Planning & Conflict Resolution (Badminton list)
  console.log('\n--- Test Scenario 2: Multi-Tool & Conflict Resolution (Badminton) ---');
  const plan2 = await tiEngine.planExecution('Yarın badminton malzeme listesini hazırla.');
  if (plan2.steps.length > 1 && plan2.steps.some(s => s.tool === 'reminders') && plan2.steps.some(s => s.tool === 'calendar')) {
    console.log('✅ Passed: Multi-tool plan successfully compiled for badminton.');
  } else {
    console.error('❌ Failed: Badminton planning failed:', plan2.steps);
    process.exit(1);
  }

  // Test C: Internet Decision (Default local vs explicit research)
  console.log('\n--- Test Scenario 3: Internet Decision Logic ---');
  const planLocal = await tiEngine.planExecution('Bolu Gençlik ve Spor İl Müdürlüğü için plan tasarla.');
  const hasLocalInternet = planLocal.steps.some(s => s.tool === 'internet');
  
  const planResearch = await tiEngine.planExecution('Bolu Gençlik ve Spor İl Müdürlüğü hakkında internette araştır.');
  const hasResearchInternet = planResearch.steps.some(s => s.tool === 'internet');

  if (!hasLocalInternet && hasResearchInternet) {
    console.log('✅ Passed: Internet decision engine restricts internet unless explicitly requested.');
  } else {
    console.error('❌ Failed: Internet decision mismatch. Local has internet:', hasLocalInternet, 'Research has internet:', hasResearchInternet);
    process.exit(1);
  }

  // Test D: Confirmation Flow
  console.log('\n--- Test Scenario 4: Confirmation Flow ---');
  if (plan1.requiresConfirmation === true) {
    console.log('✅ Passed: Calendar plan requires user confirmation.');
  } else {
    console.error('❌ Failed: Calendar plan did not trigger confirmation request.');
    process.exit(1);
  }

  // Test E: Learning integration stats check
  console.log('\n--- Test Scenario 5: Learning & Diagnostics ---');
  const diagnostics = tiEngine.getDiagnostics();
  if (diagnostics && diagnostics.mostUsedTool !== 'None' && diagnostics.toolAccuracyPercent > 80) {
    console.log('✅ Passed: Tool Intelligence learning stats are active and reporting.');
  } else {
    console.error('❌ Failed: Diagnostics mismatch:', diagnostics);
    process.exit(1);
  }

  console.log('\n🎉 ALL TOOL INTELLIGENCE ENGINE TESTS PASSED!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Error during unit tests:', err);
  process.exit(1);
});
