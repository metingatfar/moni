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

import { performanceProfiler } from '../src/core/observability/PerformanceProfiler';

console.log('=============================================');
console.log('=== RUNNING PERFORMANCE PROFILER TESTS ===');
console.log('=============================================');

performanceProfiler.resetMetrics();

// Log mock durations
performanceProfiler.recordDuration('Memory', 50);
performanceProfiler.recordDuration('Conversation', 120);
performanceProfiler.recordDuration('LLM', 450);
performanceProfiler.recordDuration('LifeModel', 30);

const metrics = performanceProfiler.getMetrics();
if (metrics.length !== 4) {
  console.error('❌ Failed: Performance metrics count mismatch!');
  process.exit(1);
}

const slowest = performanceProfiler.getSlowestModule();
if (slowest !== 'LLM') {
  console.error(`❌ Failed: Slowest module expected 'LLM', got '${slowest}'!`);
  process.exit(1);
}

const fastest = performanceProfiler.getFastestModule();
if (fastest !== 'LifeModel') {
  console.error(`❌ Failed: Fastest module expected 'LifeModel', got '${fastest}'!`);
  process.exit(1);
}

console.log('✅ Success: Performance profiler stats validated.');
console.log('🎉 PERFORMANCE PROFILER TESTS PASSED!');
process.exit(0);
