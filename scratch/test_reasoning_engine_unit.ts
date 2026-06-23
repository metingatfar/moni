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
console.log('=== RUNNING REASONING ENGINE UNIT TESTS ===');
console.log('=============================================');

// 1. Bootstrap
bootstrapServices();

// 2. Resolve ReasoningEngine
const reasoningEngine = container.resolve<any>('ReasoningEngine');
if (!reasoningEngine) {
  console.error('❌ Failed: ReasoningEngine not resolved!');
  process.exit(1);
}
console.log('✅ Success: ReasoningEngine registered and resolved.');

async function runTests() {
  // Scenario 1: Hypothesis Generation
  console.log('\n--- Test Scenario 1: Hypothesis Generation ---');
  const { HypothesisGenerator } = await import('../src/core/reasoning/HypothesisGenerator');
  const generator = new HypothesisGenerator();
  const hypotheses = generator.generateHypotheses('FitHayat\'ı geliştir.');
  if (hypotheses.length >= 2 && hypotheses[0].intentType === 'project_planning') {
    console.log('✅ Passed: Multiple hypotheses successfully generated.');
    hypotheses.forEach(h => {
      console.log(`- Hypothesis: ${h.meaning} | Conf: ${h.initialConfidence}`);
    });
  } else {
    console.error('❌ Failed: Hypothesis generation mismatch:', hypotheses);
    process.exit(1);
  }

  // Scenario 2: Evidence Collection
  console.log('\n--- Test Scenario 2: Evidence Collection ---');
  const evidences = reasoningEngine['evidenceCollector'].collectEvidence('FitHayat');
  if (evidences.length > 0) {
    console.log(`✅ Passed: Collected ${evidences.length} evidence facts.`);
    evidences.forEach((e: any) => {
      console.log(`- Source: ${e.source} | Fact: ${e.fact}`);
    });
  } else {
    console.error('❌ Failed: No evidence collected.');
    process.exit(1);
  }

  // Scenario 3: Alternative Analysis & Risk Assessment
  console.log('\n--- Test Scenario 3: Alternative Analysis & Risk ---');
  const explanation = await reasoningEngine.reason('FitHayat\'ı geliştir.');
  if (explanation && explanation.confidencePercent > 50) {
    console.log('✅ Passed: Decision analyzed and explainability generated.');
    console.log('Explainable Decision Summary:');
    console.log(`- Selected: ${explanation.humanReadableSummary}`);
    console.log(`- Risks: ${explanation.potentialRisks.join(', ')}`);
  } else {
    console.error('❌ Failed: Explainability summary empty or confidence low.');
    process.exit(1);
  }

  // Scenario 4: Reflection Correctness
  console.log('\n--- Test Scenario 4: Reflection Engine Correction ---');
  const { AlternativeGenerator } = await import('../src/core/reasoning/AlternativeGenerator');
  const { RiskAnalyzer } = await import('../src/core/reasoning/RiskAnalyzer');
  const { DecisionEngine } = await import('../src/core/reasoning/DecisionEngine');
  const { ReflectionEngine } = await import('../src/core/reasoning/ReflectionEngine');

  const altGen = new AlternativeGenerator();
  const riskAnalyzer = new RiskAnalyzer();
  const decEngine = new DecisionEngine();
  const reflectionEngine = new ReflectionEngine();

  const alts = altGen.generateAlternatives('project_planning');
  const risks = alts.map(alt => riskAnalyzer.analyzeRisk(alt));
  const choice = decEngine.makeDecision(alts, risks);

  // Simulating empty evidence context to verify reflection confidence drop
  const reflection = reflectionEngine.reflectOnDecision(choice, []);
  if (reflection.adjustedConfidence < choice.selectedAlternative.confidence) {
    console.log(`✅ Passed: Reflection engine revised confidence due to missing context.`);
    console.log(`- Original Confidence: ${choice.selectedAlternative.confidence} | Revised: ${reflection.adjustedConfidence}`);
  } else {
    console.error('❌ Failed: Reflection engine did not adjust confidence.');
    process.exit(1);
  }

  console.log('\n🎉 ALL REASONING ENGINE TESTS PASSED!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Error during unit tests:', err);
  process.exit(1);
});
