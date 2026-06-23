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

import { container } from '../src/core/container/ServiceContainer';
import { bootstrapServices } from '../src/core/container/Bootstrap';

console.log('=============================================');
console.log('=== RUNNING OBSERVABILITY CENTER UNIT TESTS ===');
console.log('=============================================');

// 1. Bootstrap
bootstrapServices();

// 2. Resolve ObservabilityCenter
const obCenter = container.resolve<any>('ObservabilityCenter');
if (!obCenter) {
  console.error('❌ Failed: ObservabilityCenter not resolved!');
  process.exit(1);
}
console.log('✅ Success: ObservabilityCenter registered and resolved.');

// 3. Check diagnostics structure
const diagnostics = obCenter.getDiagnostics();
if (diagnostics.profilerActive !== true) {
  console.error('❌ Failed: Profiler not reported active.');
  process.exit(1);
}
console.log('✅ Success: Diagnostics structure verified.');

console.log('🎉 ALL OBSERVABILITY CENTER TESTS PASSED!');
process.exit(0);
