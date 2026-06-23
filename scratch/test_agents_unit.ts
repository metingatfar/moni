/// <reference types="node" />
import { LifeModel } from '../src/core/life/LifeModel';
import { ExecutiveBrain } from '../src/core/brain/ExecutiveBrain';
import { AIOrchestrator } from '../src/core/ai/AIOrchestrator';
import { Planner } from '../src/core/planner/Planner';
import { ToolManager } from '../src/core/tools/ToolManager';
import { ShortTermMemory } from '../src/core/memory/ShortTermMemory';
import { LongTermMemory } from '../src/core/memory/LongTermMemory';
import { container } from '../src/core/container/ServiceContainer';
import { ConversationEngine } from '../src/core/conversation/ConversationEngine';
import { SecurityHelper } from '../src/memory/SecurityHelper';
import { agentManager } from '../src/core/agents/AgentManager';
import { agentRegistry } from '../src/core/agents/AgentRegistry';
import { GoalAgent } from '../src/core/agents/GoalAgent';
import { HealthAgent } from '../src/core/agents/HealthAgent';
import { FitnessAgent } from '../src/core/agents/FitnessAgent';
import { WorkAgent } from '../src/core/agents/WorkAgent';
import { LearningAgent } from '../src/core/agents/LearningAgent';
import { NotificationAgent } from '../src/core/agents/NotificationAgent';
import { ProactiveEngine } from '../src/core/proactive/ProactiveEngine';

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

async function runAgentTests() {
  console.log('======================================================');
  console.log('=== STARTING MONI AGENT ENGINE FOUNDATION TESTS ===');
  console.log('======================================================');

  // Initialize and mock dependencies
  const aiOrch = new AIOrchestrator();
  aiOrch.chatComplete = async (options: any) => {
    return JSON.stringify({ save: false });
  };
  aiOrch.chatStream = async (options: any, onChunk: any) => {
    onChunk("Normal AI Chat Response: Merhaba! Size nasıl yardımcı olabilirim?");
  };

  const planner = new Planner();
  const toolManager = new ToolManager();
  const shortTermMemory = new ShortTermMemory();
  const longTermMemory = new LongTermMemory();
  const lifeModel = new LifeModel();
  const conversationEngine = new ConversationEngine(aiOrch);
  const proactiveEngine = new ProactiveEngine();

  // Clear previous registry if any and register all agents
  agentRegistry.clear();
  agentRegistry.register(new GoalAgent());
  agentRegistry.register(new HealthAgent());
  agentRegistry.register(new FitnessAgent());
  agentRegistry.register(new WorkAgent());
  agentRegistry.register(new LearningAgent());
  agentRegistry.register(new NotificationAgent());

  // Register in container
  container.register('AIOrchestrator', aiOrch);
  container.register('Planner', planner);
  container.register('ToolManager', toolManager);
  container.register('ShortTermMemory', shortTermMemory);
  container.register('LongTermMemory', longTermMemory);
  container.register('LifeModel', lifeModel);
  container.register('ConversationEngine', conversationEngine);
  container.register('ProactiveEngine', proactiveEngine);
  container.register('AgentManager', agentManager);

  // Set mock database items
  const mockMemories: any[] = [];
  g.localStorage.setItem('moni_memories', SecurityHelper.encrypt(JSON.stringify(mockMemories)));
  g.localStorage.setItem('moni_reminders', JSON.stringify([]));
  g.localStorage.setItem('moni_todos', JSON.stringify([]));

  const brain = new ExecutiveBrain(
    aiOrch,
    planner,
    toolManager,
    shortTermMemory,
    longTermMemory,
    'Metin'
  );

  try {
    await lifeModel.analyze(true);

    async function testSentence(input: string) {
      console.log(`\n👤 Kullanıcı: "${input}"`);
      let response = '';
      await brain.processInput(input, (chunk) => {
        response += chunk;
      });
      console.log(`🤖 MONI: "${response}"`);
      return response;
    }

    // 1. Health Agent - Diagnosis and treatment warning test
    console.log('\n--- Test 1: Sağlık Ajansı Teşhis / Tedavi Uyarısı ---');
    const healthResp1 = await testSentence("Kendimi yorgun hissediyorum, başım ağrıyor.");
    if (!healthResp1.toLowerCase().includes("hekim") && !healthResp1.toLowerCase().includes("doktor")) {
      throw new Error("❌ Sağlık ajanı tıbbi danışma uyarısı içermiyor!");
    }
    console.log("✅ Sağlık ajanı güvenli dil ve hekim tavsiyesi testi başarılı.");

    // 2. Health Agent - Blood pressure format test
    console.log('\n--- Test 2: Sağlık Ajansı Tansiyon Kaydı ---');
    const healthResp2 = await testSentence("Tansiyonumu kaydet: 135/85");
    if (!healthResp2.includes("135/85")) {
      throw new Error("❌ Tansiyon kaydı başarısız!");
    }
    console.log("✅ Sağlık ajanı tansiyon kaydetme testi başarılı.");

    // 3. Work Agent - Organize workday
    console.log('\n--- Test 3: İş Ajansı İşleri Toparlama ---');
    const workResp = await testSentence("Bugün kalan işlerimi toparla.");
    if (!workResp.toLowerCase().includes("göreviniz") && !workResp.toLowerCase().includes("çalışmaya başlayabilirsiniz")) {
      throw new Error("❌ İş ajanı hatalı yanıt verdi!");
    }
    console.log("✅ İş ajanı günü organize etme testi başarılı.");

    // 4. Fitness Agent - Suggest activity
    console.log('\n--- Test 4: Spor Ajansı Yüzme Önerisi ---');
    const fitnessResp = await testSentence("Bugün yüzmeye gitsem iyi olur mu?");
    if (!fitnessResp.toLowerCase().includes("yüzmek harika bir") && !fitnessResp.toLowerCase().includes("seans yapabilirsiniz")) {
      throw new Error("❌ Spor ajanı yüzme önerisi vermedi!");
    }
    console.log("✅ Spor ajanı egzersiz önerisi testi başarılı.");

    // 5. Learning Agent - Vocabulary quiz
    console.log('\n--- Test 5: Öğrenme Ajansı Kelime Sorma ---');
    const learningResp = await testSentence("Bana bir kelime sor, çalışalım.");
    if (!learningResp.toLowerCase().includes("orchestration")) {
      throw new Error("❌ Kelime ajanı kelime sormadı!");
    }
    console.log("✅ Öğrenme ajansı kelime sorma testi başarılı.");

    // 6. Notification Agent - Confirmation requirement check
    console.log('\n--- Test 6: Hatırlatıcı Ajansı & Confirmation/İptal Akışı ---');
    const noteResp = await testSentence("Yarın saat 9'da ilaçlarımı hatırlat.");
    const diagnostics = agentManager.getDiagnostics();
    if (!diagnostics.confirmationPending) {
      throw new Error("❌ Hatırlatıcı ajanı confirmation beklemedi!");
    }
    console.log("✅ Hatırlatıcı onay aşamasına alındı.");

    // Reject flow check
    const rejectResp = await testSentence("Hayır, kalsın.");
    if (!rejectResp.includes("iptal ettim")) {
      throw new Error("❌ Hatırlatıcı iptal akışı başarısız!");
    }
    const diagAfterReject = agentManager.getDiagnostics();
    if (diagAfterReject.confirmationPending) {
      throw new Error("❌ İptal sonrasında confirmation durumu sıfırlanmadı!");
    }
    console.log("✅ İptal akışı testi başarılı.");

    // 7. Goal Agent - Confirmation check & Approve flow check
    console.log('\n--- Test 7: Hedef Ajansı & Onaylama Akışı ---');
    const goalResp = await testSentence("Hedefim her gün 30 dakika İngilizce çalışmak.");
    const goalDiag = agentManager.getDiagnostics();
    if (!goalDiag.confirmationPending) {
      throw new Error("❌ Hedef ajansı onay beklemedi!");
    }
    console.log("✅ Hedef onay aşamasına alındı.");

    // Approve flow check
    const approveResp = await testSentence("Evet, onaylıyorum.");
    if (!approveResp.includes("onayladım ve başarıyla gerçekleştirdim")) {
      throw new Error("❌ Hedef onaylama akışı başarısız!");
    }
    const diagAfterApprove = agentManager.getDiagnostics();
    if (diagAfterApprove.confirmationPending) {
      throw new Error("❌ Onaylama sonrasında confirmation durumu sıfırlanmadı!");
    }
    console.log("✅ Onaylama akışı testi başarılı.");

    // 8. Low confidence fallback test
    console.log('\n--- Test 8: Düşük Confidence ile Normal Yapay Zekâ Sohbetine Geçiş ---');
    const fallbackResp = await testSentence("Selam MONI, nasılsın?");
    if (!fallbackResp.includes("Normal AI Chat Response")) {
      throw new Error("❌ Düşük confidence durumunda normal sohbete fallback gerçekleşmedi!");
    }
    console.log("✅ Düşük confidence fallback testi başarılı.");

    console.log('\n======================================================');
    console.log('=== TÜM AJAN MOTORU TESTLERİ BAŞARIYLA TAMAMLANDI ===');
    console.log('======================================================');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Test başarısız:', err);
    process.exit(1);
  }
}

runAgentTests();
