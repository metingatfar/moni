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

import { pipelineTracer } from '../src/core/observability/PipelineTracer';
import { traceLogger } from '../src/core/observability/TraceLogger';

console.log('=============================================');
console.log('=== RUNNING PIPELINE TRACER UNIT TESTS ===');
console.log('=============================================');

// Clear existing logs
traceLogger.clearLogs();

// Start trace
const reqId = 'test-req-1';
pipelineTracer.startTrace(reqId, 'Merhaba Moni');
console.log('✅ Success: Trace initialized.');

// Trace steps
pipelineTracer.traceStep('Conversation', 'started');
pipelineTracer.traceStep('Conversation', 'completed');
pipelineTracer.traceStep('LLM', 'started');
pipelineTracer.traceStep('LLM', 'failed', 'Network timeout');
console.log('✅ Success: Telemetry steps added.');

// End trace
const trace = pipelineTracer.endTrace('Failed response');
if (!trace) {
  console.error('❌ Failed: endTrace returned null!');
  process.exit(1);
}

if (trace.status !== 'failed') {
  console.error('❌ Failed: Trace status did not reflect failure step!');
  process.exit(1);
}

// Log trace
traceLogger.logTrace(trace);
const logs = traceLogger.getTraces();
if (logs.length !== 1 || logs[0].requestId !== reqId) {
  console.error('❌ Failed: Trace not logged correctly in TraceLogger!');
  process.exit(1);
}

console.log('✅ Success: Trace persistence validated.');
console.log('🎉 PIPELINE TRACER TESTS PASSED!');
process.exit(0);
