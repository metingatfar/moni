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
import { workflowEngine } from '../src/core/workflows/WorkflowEngine';
import { WorkflowTool } from '../src/core/tools/WorkflowTool';

async function runWorkflowTests() {
  console.log('======================================================');
  console.log('=== STARTING MONI WORKFLOW ENGINE TESTS ===');
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
  toolManager.registerTool(new WorkflowTool());

  // Mock basic tool actions
  const executionLog: any[] = [];
  toolManager.executeTool = async (name: string, params: any) => {
    console.log(`[Mock ToolManager] executeTool called: ${name}`, params);
    executionLog.push({ name, params });
    return { success: true };
  };

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
  container.register('WorkflowEngine', workflowEngine);

  // Set mock database items
  g.localStorage.setItem('moni_workflows', JSON.stringify([]));
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

    // Test 1: Workflow creation flow through ExecutiveBrain
    console.log('\n--- Test 1: ExecutiveBrain & Workflow Creation Onay Akışı ---');
    const resp1 = await testSentence("Her akşam ilaçlarımı hatırlat");
    if (!resp1.includes("onaylıyor musunuz")) {
      throw new Error("❌ Workflow oluşturma onay istemedi!");
    }

    // Approve creation
    const resp2 = await testSentence("Evet, onaylıyorum.");
    if (!resp2.includes("onayladım ve başarıyla gerçekleştirdim")) {
      throw new Error("❌ Workflow oluşturma onayı başarısız oldu!");
    }
    console.log("✅ Workflow oluşturma onay akışı başarılı.");

    // Test 2: Workflow duplicate prevention
    console.log('\n--- Test 2: Workflow Yinelenme Engelleme (Duplicate Prevention) ---');
    const workflowsBefore = workflowEngine.getWorkflows().length;
    console.log(`İlk workflow sayısı: ${workflowsBefore}`);
    
    // Attempt duplicate creation of same workflow "Her akşam ilaçlarımı hatırlat"
    const respDup = await testSentence("Her akşam ilaçlarımı hatırlat");
    if (respDup.includes("onaylıyor musunuz")) {
      // Approve again
      await testSentence("Evet, onaylıyorum.");
    }
    
    const workflowsAfter = workflowEngine.getWorkflows().length;
    console.log(`İkinci deneme sonrası workflow sayısı: ${workflowsAfter}`);
    if (workflowsAfter !== workflowsBefore) {
      throw new Error("❌ Mükerrer (duplicate) workflow oluşturuldu!");
    }
    console.log("✅ Mükerrer workflow engelleme başarılı.");

    // Test 3: Trigger / Condition Execution
    console.log('\n--- Test 3: Workflow Trigger ve Condition Execution ---');
    const wfs = workflowEngine.getWorkflows();
    if (wfs.length === 0) {
      throw new Error("❌ Hiç workflow bulunamadı!");
    }
    const targetWf = wfs[0];
    console.log(`Tetiklenecek Workflow: ${targetWf.title} (ID: ${targetWf.id})`);
    
    // Execute workflow
    executionLog.length = 0; // Clear execution log
    const execSuccess = await workflowEngine.executeWorkflow(targetWf.id);
    if (!execSuccess) {
      throw new Error("❌ Workflow çalıştırılamadı!");
    }
    
    console.log("Mock executeTool calls:", executionLog);
    if (executionLog.length === 0) {
      throw new Error("❌ Workflow aksiyonları yürütülmedi!");
    }
    console.log("✅ Workflow trigger ve condition execution başarılı.");

    // Test 4: Goal Auto-Recommendations
    console.log('\n--- Test 4: GoalEngine & Auto-Recommendations ---');
    // Creating a goal should trigger workflow recommendations (paused by default)
    const recs = workflowEngine.planRecommendationsForGoal('goal-123', 'Kitap Okuma');
    console.log(`Önerilen Workflow Sayısı: ${recs.length}`);
    if (recs.length === 0) {
      throw new Error("❌ Hedef için workflow önerisi üretilemedi!");
    }
    for (const rec of recs) {
      console.log(`- Öneri: "${rec.title}" (Durum: ${rec.status}, Onay Gereksinimi: ${rec.requiresConfirmation})`);
      if (rec.status !== 'paused') {
        throw new Error("❌ Önerilen workflow aktif olarak başladı, paused olmalıydı!");
      }
    }
    console.log("✅ Goal workflow önerileri başarıyla doğrulandı.");

    // Test 5: Diagnostics Output
    console.log('\n--- Test 5: Diagnostics Doğrulaması ---');
    const diag = workflowEngine.getDiagnostics();
    console.log("Workflow Diagnostics:", diag);
    if (diag.activeWorkflowsCount !== 1) {
      throw new Error("❌ Diagnostics activeWorkflowsCount eşleşmiyor!");
    }
    console.log("✅ Diagnostics çıktısı başarıyla doğrulandı.");

    console.log('\n======================================================');
    console.log('=== TÜM WORKFLOW ENGINE TESTLERİ BAŞARIYLA GEÇTİ ===');
    console.log('======================================================');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Test başarısız:', err);
    process.exit(1);
  }
}

runWorkflowTests();
