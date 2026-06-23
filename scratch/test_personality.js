// Quick PersonalityEngine pattern matching unit test
// Tests regex patterns used by PersonalityEngine for mode switching and emotional detection// Since it's TypeScript, test the logic patterns directly
const MODE_SWITCH_PATTERNS = [
  { text: 'daha samimi konuş', expected: 'samimi' },
  { text: 'resmi konuş', expected: 'profesyonel' },
  { text: 'koç gibi konuş', expected: 'koc' },
  { text: 'antrenör gibi konuş', expected: 'antrenor' },
  { text: 'antrenör gibi motive et', expected: 'antrenor' },
  { text: 'yönetici gibi konuş', expected: 'yonetici' },
  { text: 'normal konuş', expected: 'normal' },
  { text: 'merhaba moni', expected: null },
  { text: 'yarın toplantı ayarla', expected: null },
];

const EMOTIONAL_PATTERNS = [
  { text: 'bugün moralim bozuk', expected: 'sad' },
  { text: 'çok yorgunum', expected: 'tired' },
  { text: 'sinirli oldum', expected: 'frustrated' },
  { text: 'merhaba', expected: null },
];

// Test mode switch patterns
const modeSwitchPatterns = [
  { pattern: /(?:daha\s+)?samimi\s+konuş/i, mode: 'samimi' },
  { pattern: /resmi\s+konuş/i, mode: 'profesyonel' },
  { pattern: /koç\s+gibi\s+konuş/i, mode: 'koc' },
  { pattern: /antrenör\s+gibi\s+(?:konuş|motive)/i, mode: 'antrenor' },
  { pattern: /yönetici\s+gibi\s+konuş/i, mode: 'yonetici' },
  { pattern: /normal\s+konuş/i, mode: 'normal' },
];

const emotionalPatterns = [
  { pattern: /moralim\s+bozuk/i, state: 'sad' },
  { pattern: /çok\s+yoruldum|yorgunum/i, state: 'tired' },
  { pattern: /sinir(?:liyim|li)/i, state: 'frustrated' },
];

function detectModeSwitch(text) {
  const cleanText = text.toLowerCase().trim();
  for (const { pattern, mode } of modeSwitchPatterns) {
    if (pattern.test(cleanText)) return mode;
  }
  return null;
}

function detectEmotionalState(text) {
  const cleanText = text.toLowerCase().trim();
  for (const { pattern, state } of emotionalPatterns) {
    if (pattern.test(cleanText)) return state;
  }
  return null;
}

console.log('=== MODE SWITCH TESTS ===');
let passCount = 0;
let failCount = 0;

for (const test of MODE_SWITCH_PATTERNS) {
  const result = detectModeSwitch(test.text);
  const passed = result === test.expected;
  console.log(`${passed ? 'PASS' : 'FAIL'} | "${test.text}" → ${result} (expected: ${test.expected})`);
  if (passed) passCount++; else failCount++;
}

console.log('\n=== EMOTIONAL STATE TESTS ===');
for (const test of EMOTIONAL_PATTERNS) {
  const result = detectEmotionalState(test.text);
  const passed = result === test.expected;
  console.log(`${passed ? 'PASS' : 'FAIL'} | "${test.text}" → ${result} (expected: ${test.expected})`);
  if (passed) passCount++; else failCount++;
}

console.log(`\n=== RESULTS: ${passCount} passed, ${failCount} failed ===`);
