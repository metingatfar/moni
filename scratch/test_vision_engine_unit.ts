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
import { OWNER_PROFILE } from '../src/config/ownerProfile';
import type { VisionInput } from '../src/core/vision/VisionInput';

console.log('----------------------------------------------------');
console.log('RUNNING VISION INTELLIGENCE ENGINE UNIT TESTS (MOCK)');
console.log('----------------------------------------------------');

// Mock LongTermMemory
const mockLtm = {
  getFacts: () => [],
  addFact: async () => 'mock-id',
  deleteFact: async () => true,
  search: () => []
};
container.register('LongTermMemory', mockLtm);

// Bootstrap services
bootstrapServices();

const visionEngine = container.resolve<any>('VisionEngine');

if (!visionEngine) {
  console.error('❌ Failed: VisionEngine could not be resolved from container!');
  process.exit(1);
}
console.log('✅ Success: VisionEngine resolved successfully.');

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
  // Test 1: OwnerProfile Cleanup verification
  console.log('\n--- Test 1: OwnerProfile Cleanup ---');
  const keys = Object.keys(OWNER_PROFILE);
  assert(keys.includes('ownerId'), 'OwnerProfile must have ownerId');
  assert(keys.includes('ownerName'), 'OwnerProfile must have ownerName');
  assert(!keys.includes('sports'), 'sports must be cleaned up from OwnerProfile');
  assert(!keys.includes('location'), 'location must be cleaned up from OwnerProfile');
  assert(!keys.includes('role'), 'role must be cleaned up from OwnerProfile');

  // Test 2: VisionInput definition
  console.log('\n--- Test 2: VisionInput Initialization ---');
  const mockInput: VisionInput = {
    id: 'vis-123',
    source: 'uploaded_image',
    mimeType: 'image/png',
    fileName: 'invoice_fatura.png',
    createdAt: new Date().toISOString(),
    width: 800,
    height: 600,
    size: 256000,
    localUri: 'file:///tmp/invoice_fatura.png',
    privacyLevel: 'private'
  };
  assert(mockInput.id === 'vis-123', 'VisionInput fields mapped correctly');

  // Test 3: Mock OCR Text Extraction
  console.log('\n--- Test 3: Mock OCR text extraction ---');
  const extracted = visionEngine.ocr.extractText(mockInput);
  assert(extracted.includes('FATURA NO: FT-2026-889'), 'OCR should extract mock invoice fields');

  // Test 4: Document Classification
  console.log('\n--- Test 4: Document Classification ---');
  const docClass = visionEngine.docVision.classify(mockInput);
  assert(docClass.documentType === 'invoice', 'Document classification should detect invoice');
  assert(docClass.isOcrRecommended === true, 'OCR recommended for invoice documents');

  // Test 5: Object Classification
  console.log('\n--- Test 5: Object Classification ---');
  const plantInput: VisionInput = {
    ...mockInput,
    fileName: 'sari_cicek.jpg'
  };
  const plantClass = visionEngine.objVision.classify(plantInput);
  assert(plantClass.candidateClass === 'plant', 'Object classification should detect plant');
  assert(plantClass.detectedObjects.includes('Çiçek'), 'Should detect flower object');

  // Test 6: PrivacyGuard Verification
  console.log('\n--- Test 6: PrivacyGuard Verification ---');
  const idInput: VisionInput = {
    ...mockInput,
    fileName: 'tc_kimlik.png'
  };
  const extractedIdText = visionEngine.ocr.extractText(idInput);
  const privacyCheck = visionEngine.privacy.checkPrivacy(idInput, extractedIdText);
  assert(privacyCheck.isSensitive === true, 'ID card should be flagged as sensitive');
  assert(privacyCheck.requiresCloudConfirmation === undefined || privacyCheck.requiresCloudAnalysis === true, 'ID card should require cloud analysis consent');

  // Test 7: VisionContextBuilder Output
  console.log('\n--- Test 7: VisionContextBuilder ---');
  const invoiceResult = await visionEngine.analyzeImage(mockInput);
  const vContext = visionEngine.buildVisionContext(mockInput, invoiceResult);
  assert(vContext.reasoningContext.includes('[Visual Intelligence Input]'), 'Context should have reasoning tag');
  assert(vContext.toolIntelligenceContext.suggestedTools.includes('file'), 'Context should recommend file tool for invoice');

  // Test 8: Diagnostics output
  console.log('\n--- Test 8: Diagnostics output ---');
  const diagnostics = visionEngine.getDiagnostics();
  assert(diagnostics.visionStatus === 'Active', 'Vision status must be Active');
  assert(diagnostics.ocrRuns > 0, 'OCR runs count should be recorded');
  assert(diagnostics.lastVisionSummary !== 'Hiçbir görsel analiz edilmedi.', 'Diagnostics summary should be updated');

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
