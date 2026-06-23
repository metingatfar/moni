/// <reference types="node" />
import { ExecutiveBrain } from '../src/core/brain/ExecutiveBrain';
import { AIOrchestrator } from '../src/core/ai/AIOrchestrator';
import { Planner } from '../src/core/planner/Planner';
import { ToolManager } from '../src/core/tools/ToolManager';
import { ShortTermMemory } from '../src/core/memory/ShortTermMemory';
import { LongTermMemory } from '../src/core/memory/LongTermMemory';
// Mock browser global environment using globalThis
const storage = {};
const g = globalThis;
g.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => { storage[key] = val; },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { for (const k in storage)
        delete storage[k]; },
    length: 0,
    key: (index) => null
};
g.window = {
    dispatchEvent: () => { }
};
// Set backend API URL for AIOrchestrator
g.process.env.VITE_BACKEND_API_URL = 'http://localhost:5000/api';
async function runMemoryTests() {
    console.log('======================================================');
    console.log('=== STARTING MONI LONG-TERM MEMORY ENGINE INTEGRATION TESTS ===');
    console.log('======================================================');
    // Initialize dependencies
    const aiOrch = new AIOrchestrator();
    const planner = new Planner();
    const toolManager = new ToolManager();
    const shortTermMemory = new ShortTermMemory();
    const longTermMemory = new LongTermMemory();
    const brain = new ExecutiveBrain(aiOrch, planner, toolManager, shortTermMemory, longTermMemory, 'Metin');
    // Helper to run pipeline and print interaction
    async function testSentence(input) {
        console.log(`\n👤 Kullanıcı: "${input}"`);
        let response = '';
        await brain.processInput(input, (chunk) => {
            response += chunk;
        });
        console.log(`🤖 MONI: "${response}"`);
        return response;
    }
    try {
        // Wait for LongTermMemory to initialize from local storage mock
        await new Promise(resolve => setTimeout(resolve, 500));
        // Test 1: Explicit Save
        await testSentence("Bunu hatırla, kahveyi şekersiz içerim.");
        // Test 2: Implicit Save (Favorite Sport)
        await testSentence("Benim favori sporum badminton.");
        // Test 3: Implicit Save (Goal)
        await testSentence("Hedefim 90 kiloya düşmek.");
        // Wait for background implicit extractions to complete
        console.log('\n[Sistem] Arka plan hafıza ayıklama işlemleri için bekleniyor (3 saniye)...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Test 4: Query preference
        await testSentence("Ben kahveyi nasıl içerim?");
        // Test 5: Query sport
        await testSentence("Favori sporum neydi?");
        // Test 6: Delete memory
        await testSentence("Kahve tercihimi unut.");
        // Wait for delete process
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Test 7: Query overall memory
        await testSentence("Benimle ilgili ne hatırlıyorsun?");
        console.log('\n======================================================');
        console.log('=== HAFIZA DURUMU VE TEŞHİS RAPORU ===');
        console.log('======================================================');
        const diag = longTermMemory.getDiagnostics();
        console.log(`Toplam Hafıza Kaydı: ${diag.totalCount}`);
        console.log(`Son Kaydedilen Bilgi: ${diag.lastSaved}`);
        console.log(`Son Kullanılan Hafıza: ${diag.lastUsed}`);
        console.log(`Duplicate Engellenen Kayıt Sayısı: ${diag.duplicateBlockedCount}`);
        console.log(`Memory Engine Durumu: ${diag.status}`);
        console.log('\nKayıtlar listesi:');
        longTermMemory.getFacts().forEach(f => {
            console.log(`- [${f.category}] (Confidence: ${f.confidence}, Importance: ${f.importance}): "${f.content}"`);
        });
        console.log('======================================================');
        process.exit(0);
    }
    catch (err) {
        console.error('Test hatası:', err);
        process.exit(1);
    }
}
runMemoryTests();
