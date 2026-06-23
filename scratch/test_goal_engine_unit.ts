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
  dispatchEvent: () => {}
};

import { LifeModel } from '../src/core/life/LifeModel';
import { ExecutiveBrain } from '../src/core/brain/ExecutiveBrain';
import { AIOrchestrator } from '../src/core/ai/AIOrchestrator';
import { Planner } from '../src/core/planner/Planner';
import { ToolManager } from '../src/core/tools/ToolManager';
import { ShortTermMemory } from '../src/core/memory/ShortTermMemory';
import { LongTermMemory } from '../src/core/memory/LongTermMemory';
import { container } from '../src/core/container/ServiceContainer';
import { ConversationEngine } from '../src/core/conversation/ConversationEngine';
import { ProactiveEngine } from '../src/core/proactive/ProactiveEngine';
import { SecurityHelper } from '../src/memory/SecurityHelper';
import { agentManager } from '../src/core/agents/AgentManager';
import { agentRegistry } from '../src/core/agents/AgentRegistry';
import { GoalAgent } from '../src/core/agents/GoalAgent';
import { GoalTool } from '../src/core/tools/GoalTool';
import { goalEngine } from '../src/core/goals/GoalEngine';

async function runGoalTests() {
  console.log('======================================================');
  console.log('=== STARTING MONI GOAL INTELLIGENCE ENGINE TESTS ===');
  console.log('======================================================');

  // Initialize and mock dependencies
  const aiOrch = new AIOrchestrator();
  aiOrch.chatComplete = async (options: any) => {
    return JSON.stringify({ save: false });
  };
  aiOrch.chatStream = async (options: any, onChunk: any) => {
    onChunk("Normal AI Response");
  };

  const planner = new Planner();
  const toolManager = new ToolManager();
  
  // Register tools
  toolManager.registerTool(new GoalTool());

  const shortTermMemory = new ShortTermMemory();
  const longTermMemory = new LongTermMemory();
  const lifeModel = new LifeModel();
  const conversationEngine = new ConversationEngine(aiOrch);
  const proactiveEngine = new ProactiveEngine();

  // Clear previous registry if any and register all agents
  agentRegistry.clear();
  agentRegistry.register(new GoalAgent());

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
  container.register('GoalEngine', goalEngine);

  // Set mock database items
  g.localStorage.setItem('moni_goals', JSON.stringify([]));
  g.localStorage.setItem('moni_memories', SecurityHelper.encrypt(JSON.stringify([])));
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

    // Test 1: Goal creation flow through ExecutiveBrain
    console.log('\n--- Test 1: ExecutiveBrain & Goal Creation Onay Akışı ---');
    const resp1 = await testSentence("Hedef oluştur: 90 kiloya düşmek");
    if (!resp1.includes("onaylıyor musunuz")) {
      throw new Error("❌ Hedef oluşturma onay istemedi!");
    }

    // Approve creation
    const resp2 = await testSentence("Evet, onaylıyorum.");
    if (!resp2.includes("onayladım ve başarıyla gerçekleştirdim")) {
      throw new Error("❌ Hedef oluşturma onayı başarısız oldu!");
    }
    console.log("✅ Hedef oluşturma onay akışı başarılı.");

    // Test 2: Goal and milestones confirmation from Engine
    console.log('\n--- Test 2: Goal Engine ve Milestone Doğrulaması ---');
    const goals = goalEngine.getGoals();
    if (goals.length === 0) {
      throw new Error("❌ Hedef veritabanına eklenmedi!");
    }
    const createdGoal = goals[0];
    console.log(`Oluşturulan Hedef: "${createdGoal.title}"`);
    console.log(`Alt Hedefler (Milestones):`);
    createdGoal.milestones.forEach(m => console.log(`- ${m.title} (Durum: ${m.status})`));
    if (createdGoal.milestones.length < 3) {
      throw new Error("❌ Milestones otomatik oluşturulmadı veya eksik!");
    }
    console.log("✅ Milestones başarıyla doğrulandı.");

    // Test 3: Milestone completion and progress/score updating
    console.log('\n--- Test 3: Milestone Tamamlama & Skor Güncellemesi ---');
    // Complete first milestone
    const firstMs = createdGoal.milestones[0];
    firstMs.status = 'completed';
    // recalculate progress
    goalEngine.updateGoalProgress(createdGoal.id, 25);
    const updatedGoal = goalEngine.getGoal(createdGoal.id);
    if (!updatedGoal || updatedGoal.progress !== 25) {
      throw new Error("❌ Hedef ilerlemesi güncellenemedi!");
    }
    console.log("✅ İlerleme başarıyla güncellendi.");

    // Test 4: Goal Predictor
    console.log('\n--- Test 4: Goal Predictor Olasılıklı Dil Doğrulaması ---');
    const analysis = goalEngine.analyze({ activityScore: 90 }, true);
    if (!analysis.prediction) {
      throw new Error("❌ Prediction sonucu üretilemedi!");
    }
    console.log(`Prediction Wording: "${analysis.prediction.wording}"`);
    if (!analysis.prediction.wording.includes("%") || analysis.prediction.wording.includes("kesinlikle")) {
      throw new Error("❌ Tahmin dili kurallara veya olasılık formatına uymuyor!");
    }
    console.log("✅ Tahmin analizi başarıyla doğrulandı.");

    // Test 5: LifeModel sync check
    console.log('\n--- Test 5: LifeModel Senkronizasyon Kontrolü ---');
    await lifeModel.analyze(true);
    const lifeDiag = lifeModel.getDiagnostics();
    console.log(`LifeModel Goal Score: ${lifeDiag.goalScore}`);
    if (lifeDiag.goalScore !== 25) {
      throw new Error("❌ LifeModel Goal Score değeri GoalEngine ile senkronize değil!");
    }
    console.log("✅ LifeModel senkronizasyonu başarılı.");

    // Test 6: Diagnostics verification
    console.log('\n--- Test 6: Diagnostics Doğrulaması ---');
    const goalDiag = goalEngine.getDiagnostics({ activityScore: 90 });
    console.log(`Toplam Hedef: ${goalDiag.totalGoalsCount}`);
    console.log(`Aktif Hedef: ${goalDiag.activeGoalsCount}`);
    console.log(`Goal Completion %: ${goalDiag.goalCompletionRate}`);
    console.log(`Prediction %: ${goalDiag.predictionPercentage}`);
    if (goalDiag.totalGoalsCount !== 1 || goalDiag.activeGoalsCount !== 1) {
      throw new Error("❌ Diagnostics değerleri hatalı!");
    }
    console.log("✅ Diagnostics başarıyla doğrulandı.");

    // Test 7: Goal completion flow
    console.log('\n--- Test 7: Hedef Tamamlama Akışı ---');
    const completeResp = await testSentence("Hedefimi tamamladım");
    if (!completeResp.toLowerCase().includes("onaylıyor musunuz")) {
      throw new Error("❌ Hedef tamamlama onay istemedi!");
    }
    const completeApprove = await testSentence("Evet, onaylıyorum.");
    if (!completeApprove.includes("onayladım ve başarıyla gerçekleştirdim")) {
      throw new Error("❌ Hedef tamamlama onayı başarısız oldu!");
    }
    const finalGoal = goalEngine.getGoal(createdGoal.id);
    if (!finalGoal || finalGoal.status !== 'completed' || finalGoal.progress !== 100) {
      throw new Error("❌ Hedef statüsü tamamlandı olarak işaretlenmedi!");
    }
    console.log("✅ Hedef tamamlama akışı başarılı.");

    console.log('\n======================================================');
    console.log('=== TÜM GOAL INTELLIGENCE TESTLERİ BAŞARIYLA GEÇTİ ===');
    console.log('======================================================');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Test başarısız:', err);
    process.exit(1);
  }
}

runGoalTests();
