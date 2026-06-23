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

console.log('----------------------------------------------------');
console.log('RUNNING COGNITIVE LEARNING ENGINE UNIT TESTS (MOCK)');
console.log('----------------------------------------------------');

// Mock LongTermMemory
const mockLtm = {
  getFacts: () => [],
  addFact: async () => 'mock-id',
  deleteFact: async () => true,
  search: () => []
};
container.register('LongTermMemory', mockLtm);

// Bootstrap remaining services
bootstrapServices();

const learningEngine = container.resolve<any>('CognitiveLearningEngine');

if (!learningEngine) {
  console.error('❌ Failed: CognitiveLearningEngine could not be resolved from container!');
  process.exit(1);
}
console.log('✅ Success: CognitiveLearningEngine resolved successfully.');

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
  // Test 1: Experience creation
  console.log('\n--- Test 1: Experience creation ---');
  const mockExp = {
    userInput: 'FitHayat için yeni bir antrenman planı hazırla.',
    strategyUsed: 'FitHayatPlan',
    toolsUsed: ['goals', 'tasks'],
    response: 'FitHayat planı başarıyla oluşturuldu.',
    userFeedback: 'none' as const
  };
  const exp = await learningEngine.learn(mockExp);
  assert(exp.id !== undefined, 'Experience ID must be generated');
  assert(exp.userInput === mockExp.userInput, 'UserInput matches');

  // Test 2: Outcome evaluation
  console.log('\n--- Test 2: Outcome evaluation ---');
  const successOutcome = learningEngine.evaluator.evaluate(exp);
  assert(successOutcome === 'success', 'Standard response should evaluate to success');

  const rejectExp = {
    ...mockExp,
    userInput: 'iptal et',
    response: 'İşlemi iptal ettim, herhangi bir kayıt oluşturulmadı.'
  };
  const rejectedOutcome = learningEngine.evaluator.evaluate(rejectExp);
  assert(rejectedOutcome === 'rejected', 'Cancel response should evaluate to rejected');

  // Test 3: Strategy learning
  console.log('\n--- Test 3: Strategy learning ---');
  learningEngine.learner.learnStrategy('FitHayatPlan', 'success');
  learningEngine.learner.learnStrategy('BadStrategy', 'failure');
  const bestStrats = learningEngine.learner.getBestStrategies();
  const failedStrats = learningEngine.learner.getFailedStrategies();
  assert(bestStrats.includes('FitHayatPlan'), 'Successful strategies should be reinforced');
  assert(failedStrats.includes('BadStrategy'), 'Failed strategies should be recorded');

  // Test 4: Mistake analysis
  console.log('\n--- Test 4: Mistake analysis ---');
  const dislikeExp = {
    ...mockExp,
    userFeedback: 'dislike' as const,
    feedbackText: 'Cevap çok uzundu, daha kısa yaz.'
  };
  const mistake = learningEngine.mistakes.analyzeMistake(dislikeExp);
  assert(mistake !== undefined, 'Mistake should be analyzed from negative feedback');
  assert(mistake?.category === 'unwonted_format' || mistake?.category === 'unwanted_format', 'Category should resolve to unwanted_format');

  // Test 5: Pattern mining
  console.log('\n--- Test 5: Pattern mining ---');
  learningEngine.miner.minePattern(exp);
  const patterns = learningEngine.miner.getLearnedPatterns();
  assert(patterns.length > 0, 'Patterns should be mined');
  assert(patterns[0].pattern === 'FitHayat & Sağlık', 'First pattern should match keywords');

  // Test 6: Preference learning
  console.log('\n--- Test 6: Preference learning ---');
  const prefInput = {
    ...mockExp,
    userInput: 'Kısa cevap ver lütfen.'
  };
  const prefExp = await learningEngine.learn(prefInput);
  const prefs = learningEngine.preferences.getPreferences();
  assert(prefs.responseLength === 'short', 'Preference length should update to short');

  // Test 7: Memory consolidation
  console.log('\n--- Test 7: Memory consolidation ---');
  const likeExp = {
    ...mockExp,
    userFeedback: 'like' as const
  };
  const consolidated = learningEngine.consolidator.consolidate(likeExp, 'success');
  assert(consolidated !== undefined, 'Memory consolidation should trigger for positive feedback');
  assert(consolidated?.consolidated === true, 'Fact consolidated successfully');

  // Test 8: Learning score calculation
  console.log('\n--- Test 8: Learning score calculation ---');
  const initialOverall = learningEngine.scores.calculateOverallScore();
  assert(initialOverall > 50, 'Overall initial score should be high');

  // Test 9: Self improvement suggestions
  console.log('\n--- Test 9: Self improvement suggestions ---');
  // Lower the score of ToolIntelligenceEngine
  learningEngine.scores.updateScores('dislike', 'ToolSelection');
  const suggestions = learningEngine.planner.generateSuggestions(learningEngine.scores.getScores());
  assert(suggestions.length > 0, 'Self improvement suggestions should be generated for low scores');

  // Test 10: Diagnostics output
  console.log('\n--- Test 10: Diagnostics output ---');
  const diagnostics = learningEngine.getDiagnostics();
  assert(diagnostics.experienceCount > 0, 'Diagnostics experienceCount should be non-zero');
  assert(diagnostics.learningScore > 0, 'Diagnostics overall learningScore should be non-zero');

  console.log('\n----------------------------------------------------');
  console.log(`TEST RUN COMPLETED. Passed: ${passed}, Failed: ${failed}`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('❌ Error during unit tests:', err);
  process.exit(1);
});
