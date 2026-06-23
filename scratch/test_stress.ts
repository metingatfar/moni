/// <reference types="node" />

// Mock browser global environment using globalThis
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

import { systemTestRunner } from '../src/core/observability/SystemTestRunner';
import { bootstrapServices } from '../src/core/container/Bootstrap';

console.log('=============================================');
console.log('=== RUNNING OBSERVABILITY STRESS TESTS ===');
console.log('=============================================');

// Initialize dependencies
bootstrapServices();

async function run() {
  console.log('Running quick stress test (10 mock requests)...');
  const results = await systemTestRunner.runStressTests(10);
  
  if (results.length === 0 || results[0].status !== 'passed') {
    console.error('❌ Failed: Stress test failed or returned empty results!');
    process.exit(1);
  }

  console.log(`✅ Success: Stress test completed. Details: ${results[0].actual}`);
  console.log('🎉 OBSERVABILITY STRESS TESTS PASSED!');
  process.exit(0);
}

run().catch(e => {
  console.error('❌ Error executing stress test:', e);
  process.exit(1);
});
