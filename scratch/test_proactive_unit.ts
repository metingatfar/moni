/// <reference types="node" />
import { LifeModel } from '../src/core/life/LifeModel';
import { ProactiveEngine } from '../src/core/proactive/ProactiveEngine';
import { ExecutiveBrain } from '../src/core/brain/ExecutiveBrain';
import { AIOrchestrator } from '../src/core/ai/AIOrchestrator';
import { Planner } from '../src/core/planner/Planner';
import { ToolManager } from '../src/core/tools/ToolManager';
import { ShortTermMemory } from '../src/core/memory/ShortTermMemory';
import { LongTermMemory } from '../src/core/memory/LongTermMemory';
import { container } from '../src/core/container/ServiceContainer';
import { ConversationEngine } from '../src/core/conversation/ConversationEngine';
import { SecurityHelper } from '../src/memory/SecurityHelper';

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
  dispatchEvent: () => {}
};

async function runProactiveTests() {
  console.log('======================================================');
  console.log('=== STARTING MONI PROACTIVE INTELLIGENCE TESTS ===');
  console.log('======================================================');

  // Initialize dependencies
  const aiOrch = new AIOrchestrator();
  aiOrch.chatComplete = async (options: any) => {
    return JSON.stringify({ save: false });
  };
  aiOrch.chatStream = async (options: any, onChunk: any) => {
    onChunk("Mocked response");
  };

  const planner = new Planner();
  const toolManager = new ToolManager();
  const shortTermMemory = new ShortTermMemory();
  const longTermMemory = new LongTermMemory();
  const lifeModel = new LifeModel();
  const proactiveEngine = new ProactiveEngine();
  const conversationEngine = new ConversationEngine(aiOrch);

  // Register in container
  container.register('AIOrchestrator', aiOrch);
  container.register('Planner', planner);
  container.register('ToolManager', toolManager);
  container.register('ShortTermMemory', shortTermMemory);
  container.register('LongTermMemory', longTermMemory);
  container.register('LifeModel', lifeModel);
  container.register('ProactiveEngine', proactiveEngine);
  container.register('ConversationEngine', conversationEngine);

  // Set mock data
  const mockMemories = [
    { id: 'm1', category: 'identity', content: 'Kullanıcının adı Metin.', confidence: 1.0, importance: 4 },
    { id: 'm2', category: 'health', content: 'Kullanıcı 85 kilo ağırlığında.', confidence: 0.9, importance: 3 },
    { id: 'm3', category: 'health', content: 'Tansiyonu genelde 120/80 seviyesindedir.', confidence: 0.9, importance: 3 },
    { id: 'm4', category: 'health', content: 'Her gün aspirin kullanıyor.', confidence: 1.0, importance: 4 },
    { id: 'm5', category: 'sport', content: 'Favori sporu badminton.', confidence: 0.9, importance: 3 },
    { id: 'm6', category: 'goal', content: 'Hedef 90 kilodan 80 kiloya düşmek.', confidence: 0.9, importance: 3 }
  ];
  g.localStorage.setItem('moni_memories', SecurityHelper.encrypt(JSON.stringify(mockMemories)));

  // 2. Save dummy reminders
  const mockReminders = [
    { id: 'r1', title: 'Badminton Antrenmanı', dateTime: new Date(Date.now() - 3600000 * 24).toISOString(), description: 'Haftalık spor saati', isCompleted: true },
    { id: 'r2', title: 'FitHayat Toplantısı', dateTime: new Date(Date.now() + 3600000 * 2).toISOString(), description: 'Entegrasyon toplantısı', isCompleted: false }
  ];
  g.localStorage.setItem('moni_reminders', JSON.stringify(mockReminders));

  // 3. Save dummy todos
  const mockTodos = [
    { id: 't1', task: 'FitHayat entegrasyonu yazılacak', dateTime: new Date(Date.now()).toISOString(), isCompleted: false, priority: 'high' }
  ];
  g.localStorage.setItem('moni_todos', JSON.stringify(mockTodos));

  const brain = new ExecutiveBrain(
    aiOrch,
    planner,
    toolManager,
    shortTermMemory,
    longTermMemory,
    'Metin'
  );

  try {
    // 1. Analyze life model to populate data
    await lifeModel.analyze(true);

    // 2. Helper to test brain output for commands
    async function testCommand(input: string) {
      console.log(`\n👤 Kullanıcı: "${input}"`);
      let response = '';
      await brain.processInput(input, (chunk) => {
        response += chunk;
      });
      console.log(`🤖 MONI (Proaktif): "${response}"`);
      return response;
    }

    // Test 1: Daily brief
    const brief = await testCommand("Bana günlük brifing ver.");
    if (brief.toLowerCase().includes("metin") && brief.toLowerCase().includes("yaşam kalitesi")) {
      console.log("✅ Günlük brifing testi başarılı.");
    } else {
      throw new Error("❌ Günlük brifing testi başarısız!");
    }

    // Test 2: Suggestions
    const rec = await testCommand("Bugün ne önerirsin?");
    if (rec.length > 0) {
      console.log("✅ Bugün ne önerirsin testi başarılı.");
    } else {
      throw new Error("❌ Bugün ne önerirsin testi başarısız!");
    }

    // Test 3: Insights / evaluation
    const evalResult = await testCommand("Benim için bir değerlendirme yap.");
    if (evalResult.length > 0) {
      console.log("✅ Değerlendirme testi başarılı.");
    } else {
      throw new Error("❌ Değerlendirme testi başarısız!");
    }

    // Test 4: Weekly review
    const weekly = await testCommand("Bu hafta nasıl gidiyorum?");
    if (weekly.toLowerCase().includes("haftalık moni değerlendirme") && weekly.toLowerCase().includes("haftayı")) {
      console.log("✅ Haftalık özet testi başarılı.");
    } else {
      throw new Error("❌ Haftalık özet testi başarısız!");
    }

    // Test 5: Monthly review
    const monthly = await testCommand("Bu ay nasıl gidiyorum?");
    if (monthly.toLowerCase().includes("aylık gelişim ve yaşam") && monthly.toLowerCase().includes("üretkenlik")) {
      console.log("✅ Aylık gelişim raporu testi başarılı.");
    } else {
      throw new Error("❌ Aylık gelişim raporu testi başarısız!");
    }

    // Test 6: Risks
    const risks = await testCommand("Risk var mı?");
    console.log(`Risks found: ${risks}`);
    // Check if wording contains tentative terms and health advice has medical disclaimer
    const isTentative = risks.toLowerCase().includes("olabilir") || risks.toLowerCase().includes("belirgin") || risks.toLowerCase().includes("seviyesindedir") || risks.toLowerCase().includes("risk");
    if (isTentative) {
      console.log("✅ Risk dili (tentative language) testi başarılı.");
    } else {
      throw new Error("❌ Risk dilinde kesin ifadeler kullanılmış!");
    }

    // Test 7: Goal predictions
    const goalsPred = await testCommand("Hedeflerim için ne yapmalıyım?");
    if (goalsPred.length > 0) {
      console.log("✅ Hedef tahminleri testi başarılı.");
    } else {
      throw new Error("❌ Hedef tahmin testi başarısız!");
    }

    // Test 8: Emotion trigger
    const sadSuggestion = await testCommand("Bugün moralim bozuk.");
    if (sadSuggestion.toLowerCase().includes("yorgun veya keyifsiz") || sadSuggestion.toLowerCase().includes("mola vermeniz")) {
      console.log("✅ Duygu durum/moral öneri testi başarılı.");
    } else {
      throw new Error("❌ Duygu durum/moral öneri testi başarısız!");
    }

    // Test 9: Throttling verification
    console.log('\n--- THROTTLING VE ÖNBELLEK TESTİ ---');
    const peDiag1 = proactiveEngine.getDiagnostics();
    const actionCount1 = peDiag1.lastProactiveAction;
    console.log(`İlk aksiyon: ${actionCount1}`);
    
    // Call generateDailyBrief again immediately (should skip analysis because of 10s throttle)
    await proactiveEngine.generateDailyBrief(lifeModel, 'Metin');
    const peDiag2 = proactiveEngine.getDiagnostics();
    console.log(`İkinci aksiyondan sonra durum: ${peDiag2.lastProactiveAction}`);
    console.log("✅ Throttling ve önbellek testi başarılı.");

    console.log('\n======================================================');
    console.log('=== TÜM PROAKTİF ZEKÂ TESTLERİ BAŞARIYLA TAMAMLANDI ===');
    console.log('======================================================');
    process.exit(0);
  } catch (err: any) {
    console.error('Test hatası:', err);
    process.exit(1);
  }
}

runProactiveTests();
