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

import { healthMonitor } from '../src/core/observability/HealthMonitor';

console.log('=============================================');
console.log('=== RUNNING HEALTH MONITOR UNIT TESTS ===');
console.log('=============================================');

async function test() {
  const statuses = await healthMonitor.checkHealth();
  if (statuses.length === 0) {
    console.error('❌ Failed: Health statuses array is empty!');
    process.exit(1);
  }
  
  console.log('Retrieved health services:');
  for (const s of statuses) {
    console.log(`- ${s.service}: ${s.status} (${s.latencyMs}ms) - ${s.details}`);
  }

  const backend = statuses.find(s => s.service === 'Backend API');
  if (!backend) {
    console.error('❌ Failed: Backend API health check missing!');
    process.exit(1);
  }

  console.log('✅ Success: Health Monitor checks resolved correctly.');
  console.log('🎉 HEALTH MONITOR TESTS PASSED!');
  process.exit(0);
}

test().catch(e => {
  console.error('❌ Error executing health monitor unit test:', e);
  process.exit(1);
});
