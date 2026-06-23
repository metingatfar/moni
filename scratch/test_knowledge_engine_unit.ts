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

console.log('----------------------------------------------------');
console.log('RUNNING COGNITIVE KNOWLEDGE ENGINE UNIT TESTS (MOCK)');
console.log('----------------------------------------------------');

// Mock LongTermMemory to prevent any real filesystem/DB or API calls during bootstrap
const mockLtm = {
  getFacts: () => [
    { category: 'identity', content: 'Adı Ahmet, Mesleği Spor Şube Müdürü' }, // should be discarded/ignored
    { category: 'sport', content: 'İlgi alanı Badminton' }
  ],
  addFact: async () => 'mock-id',
  deleteFact: async () => true,
  search: () => []
};
container.register('LongTermMemory', mockLtm);

// Bootstrap remaining services
bootstrapServices();

const knowledgeEngine = container.resolve<any>('KnowledgeEngine');

if (!knowledgeEngine) {
  console.error('❌ KnowledgeEngine could not be resolved from container!');
  process.exit(1);
}

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

// Test 1: Owner Profile Integrity
console.log('\n--- Test 1: Owner Profile Integrity ---');
assert(OWNER_PROFILE.ownerName === 'Metin GATFAR', 'Owner name must be Metin GATFAR');
assert(OWNER_PROFILE.preferredName === 'Metin', 'Preferred name must be Metin');
assert(OWNER_PROFILE.ownerId === 'metin_gatfar', 'Owner ID must be metin_gatfar');

// Test 2: Ahmet / Mehmet check in PersonalKnowledge
console.log('\n--- Test 2: PersonalKnowledge Fallback & Filtering ---');
const personalFacts = knowledgeEngine.personal.getAllFacts();
const hasWrongFallback = personalFacts.some((f: any) => f.value.includes('Ahmet') || f.value.includes('Mehmet'));
assert(!hasWrongFallback, 'Ahmet or Mehmet must not appear anywhere in personal facts');

const identityFact = knowledgeEngine.personal.getFact('identity');
assert(identityFact !== undefined, 'Identity fact must be populated');
assert(identityFact?.value.includes('Metin GATFAR'), `Identity fact should refer to Metin GATFAR, got: ${identityFact?.value}`);

// Test 3: KnowledgeGraph Seed Node Check
console.log('\n--- Test 3: KnowledgeGraph Owner Node Check ---');
const ownerNode = knowledgeEngine.graph.getNode('metin_gatfar');
assert(ownerNode !== undefined, 'Owner node metin_gatfar must exist in KnowledgeGraph');
assert(ownerNode?.label === 'Metin GATFAR', 'Owner node label must be Metin GATFAR');

const connections = knowledgeEngine.graph.getConnections('metin_gatfar', 2);
assert(connections.length > 0, 'Owner node must have connected concepts');

// Test 4: "Ben kimim?" query check
console.log('\n--- Test 4: Semantic Search Query ---');
const searchResults = knowledgeEngine.query('ben kimim');
assert(searchResults.length > 0, 'Query "ben kimim" must return matching facts');
assert(searchResults.some((r: any) => r.content.includes('Metin GATFAR')), 'Search results must reference Metin GATFAR');

// Test 5: ProjectKnowledge OwnerProfile Projects Alignment
console.log('\n--- Test 5: ProjectKnowledge Projects Alignment ---');
const projects = knowledgeEngine.project.getAllProjects();
assert(projects.length >= 2, 'Project list should contain default projects');
assert(projects.some((p: any) => p.projectName === 'MONI AI Operating System'), 'Project list must contain MONI AI Operating System');
assert(projects.some((p: any) => p.projectName === 'FitHayat'), 'Project list must contain FitHayat');

// Test 6: ExecutiveState Owner details
console.log('\n--- Test 6: ExecutiveState Owner details ---');
const execState = knowledgeEngine.getExecutiveState();
assert(execState.ownerName === 'Metin GATFAR', 'ExecutiveState ownerName must be Metin GATFAR');
assert(execState.ownerId === 'metin_gatfar', 'ExecutiveState ownerId must be metin_gatfar');
assert(execState.privacyMode === 'private_owner_only', 'ExecutiveState privacyMode must be private_owner_only');

// Test 7: Diagnostics Owner fields
console.log('\n--- Test 7: Diagnostics Owner fields ---');
const diagnostics = knowledgeEngine.getDiagnostics();
assert(diagnostics.ownerName === 'Metin GATFAR', 'Diagnostics ownerName must be Metin GATFAR');
assert(diagnostics.privacyMode === 'private_owner_only', 'Diagnostics privacyMode must be private_owner_only');
assert(diagnostics.identitySource === 'owner_profile', 'Diagnostics identitySource must be owner_profile');
assert(diagnostics.isPermanentOwnerIdentity === true, 'Diagnostics isPermanentOwnerIdentity must be true');

console.log('\n----------------------------------------------------');
console.log(`TEST RUN COMPLETED. Passed: ${passed}, Failed: ${failed}`);
console.log('----------------------------------------------------');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
