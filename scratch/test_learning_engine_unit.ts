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
import { HealthAgent } from '../src/core/agents/HealthAgent';
import { FitnessAgent } from '../src/core/agents/FitnessAgent';
import { NotificationAgent } from '../src/core/agents/NotificationAgent';
import { GoalTool } from '../src/core/tools/GoalTool';
import { goalEngine } from '../src/core/goals/GoalEngine';
import { workflowEngine } from '../src/core/workflows/WorkflowEngine';
import { multiAgentEngine } from '../src/core/collaboration/MultiAgentEngine';
import { agentMemory } from '../src/core/learning/AgentMemory';
import { agentPerformanceTracker } from '../src/core/learning/AgentPerformanceTracker';
import { conflictResolver } from '../src/core/learning/ConflictResolver';
import { costOptimizer } from '../src/core/learning/CostOptimizer';
import { tokenBudgetManager } from '../src/core/learning/TokenBudgetManager';
import { agentFeedbackEngine } from '../src/core/learning/AgentFeedbackEngine';
import { smartCache } from '../src/core/learning/SmartCache';
import { learningEngine } from '../src/core/learning/LearningEngine';

async function runLearningTests() {
  console.log('======================================================');
  console.log('=== STARTING MONI AGENT LEARNING & COST TESTS ===');
  console.log('======================================================');

  // Initialize and mock dependencies
  const aiOrch = new AIOrchestrator();
  const planner = new Planner();
  const toolManager = new ToolManager();
  
  // Register tools
  toolManager.registerTool(new GoalTool());

  // Mock basic tool actions
  const executionLog: any[] = [];
  toolManager.executeTool = async (name: string, params: any) => {
    executionLog.push({ name, params });
    return { success: true };
  };

  const shortTermMemory = new ShortTermMemory();
  const longTermMemory = new LongTermMemory();
  const lifeModel = new LifeModel();
  const conversationEngine = new ConversationEngine(aiOrch);
  const proactiveEngine = new ProactiveEngine();

  // Clear previous registry and register all agents
  agentRegistry.clear();
  agentRegistry.register(new GoalAgent());
  agentRegistry.register(new HealthAgent());
  agentRegistry.register(new FitnessAgent());
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
  container.register('GoalEngine', goalEngine);
  container.register('WorkflowEngine', workflowEngine);
  container.register('MultiAgentEngine', multiAgentEngine);
  container.register('LearningEngine', learningEngine);

  // Set mock database items
  g.localStorage.setItem('moni_workflows', JSON.stringify([]));
  g.localStorage.setItem('moni_goals', JSON.stringify([]));
  g.localStorage.setItem('moni_memories', SecurityHelper.encrypt(JSON.stringify([])));
  g.localStorage.setItem('moni_reminders', JSON.stringify([]));
  g.localStorage.setItem('moni_todos', JSON.stringify([]));

  // Reset learning states
  agentMemory.clear();
  tokenBudgetManager.clear();
  smartCache.clear();

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

    // Test 1: AgentMemory recording & updates
    console.log('\n--- Test 1: AgentMemory Kayıt ve Güncelleme ---');
    const fitnessMemBefore = agentMemory.getOrCreate('fitness_agent');
    console.log(`FitnessAgent başlangıç kullanım sayısı: ${fitnessMemBefore.executionCount}`);
    
    agentMemory.update('fitness_agent', { executionCount: 5 });
    const fitnessMemAfter = agentMemory.getOrCreate('fitness_agent');
    console.log(`FitnessAgent güncellenmiş kullanım sayısı: ${fitnessMemAfter.executionCount}`);
    if (fitnessMemAfter.executionCount !== 5) {
      throw new Error("❌ AgentMemory güncellenemedi!");
    }
    console.log("✅ AgentMemory kayıtları başarıyla doğrulandı.");

    // Test 2: AgentPerformanceTracker success/failure
    console.log('\n--- Test 2: AgentPerformanceTracker Başarı/Başarısızlık Ölçümü ---');
    agentPerformanceTracker.recordExecution('fitness_agent', 15, 0.9);
    agentPerformanceTracker.recordSuccess('fitness_agent');
    
    const performanceScore = agentPerformanceTracker.getPerformanceScore('fitness_agent');
    console.log(`FitnessAgent Başarım Skoru: ${performanceScore}/100`);
    if (performanceScore < 60) {
      throw new Error("❌ Performans skoru hatalı hesaplandı!");
    }
    console.log("✅ PerformanceTracker başarıyla doğrulandı.");

    // Test 3: ConflictResolver priorities (HealthAgent > FitnessAgent)
    console.log('\n--- Test 3: ConflictResolver Çelişkili Öneriler ve Sağlık Önceliği ---');
    const conflictingVotes = [
      {
        agentId: 'fitness_agent',
        confidence: 0.9,
        summary: '30 dakika tempolu koşu öneriliyor.',
        risk: '',
        suggestedActions: [{ tool: 'tasks', params: { title: 'Spor yap' } }],
        executionTime: 12
      },
      {
        agentId: 'health_agent',
        confidence: 0.95,
        summary: 'Kullanıcı yorgun. Hafif yürüyüş yapması önerilir.',
        risk: 'Kullanıcı yorgun.',
        suggestedActions: [],
        executionTime: 10
      }
    ];

    const resolvedVotes = conflictResolver.resolveConflicts(conflictingVotes);
    console.log("Çözümlenmiş Oylar:");
    resolvedVotes.forEach(v => console.log(`- ${v.agentId}: Güven = ${v.confidence}, Özet = "${v.summary}"`));
    
    const fitnessResolved = resolvedVotes.find(v => v.agentId === 'fitness_agent')!;
    if (fitnessResolved.confidence >= 0.5) {
      throw new Error("❌ Çelişkili fitness aktivitesi güven skoru düşürülmedi!");
    }
    if (conflictResolver.getResolvedConflictCount() === 0) {
      throw new Error("❌ Çelişkili durum ConflictResolver tarafından çözümlenmedi!");
    }
    console.log("✅ ConflictResolver öncelikleri başarıyla doğrulandı.");

    // Test 4: CostOptimizer keyword & cooldown bypasses
    console.log('\n--- Test 4: CostOptimizer Bypasses (Gereksiz Ajan Azaltma) ---');
    const shouldBypass = costOptimizer.shouldSkipPipeline('merhaba', []);
    console.log(`Bypass query 'merhaba' outcome: ${shouldBypass}`);
    if (!shouldBypass) {
      throw new Error("❌ Basit keyword için bypass uygulanmadı!");
    }
    console.log("✅ CostOptimizer bypass kuralları başarıyla doğrulandı.");

    // Test 5: TokenBudgetManager costs & modes
    console.log('\n--- Test 5: TokenBudgetManager Bütçe Takibi ve Tasarruf Modları ---');
    console.log(`Başlangıç Kalan Token: ${tokenBudgetManager.getRemainingTokens()}`);
    console.log(`Başlangıç Bütçe Modu: ${tokenBudgetManager.getCostMode()}`);
    
    // Consume tokens to enter saving mode
    tokenBudgetManager.trackUsage(85000);
    console.log(`Bütçe harcaması sonrası Kalan Token: ${tokenBudgetManager.getRemainingTokens()}`);
    console.log(`Bütçe harcaması sonrası Bütçe Modu: ${tokenBudgetManager.getCostMode()}`);
    if (tokenBudgetManager.getCostMode() !== 'Saving') {
      throw new Error("❌ TokenBudgetManager bütçe modu güncellenmedi!");
    }
    console.log("✅ TokenBudgetManager limitleri başarıyla doğrulandı.");

    // Test 6: AgentFeedbackEngine parsing & learning
    console.log('\n--- Test 6: AgentFeedbackEngine Kullanıcı Tepkileri ve Skorlama ---');
    agentFeedbackEngine.setLastTriggeredAgent('fitness_agent');
    
    const feedbackResponse = await testSentence("Güzel öneri.");
    if (!feedbackResponse.includes("kaydettim")) {
      throw new Error("❌ Geri bildirim algılanamadı!");
    }
    console.log(`Geri bildirim sonrası acceptance rate: ${agentFeedbackEngine.getAcceptanceRate()}%`);
    if (agentFeedbackEngine.getAcceptanceRate() < 80) {
      throw new Error("❌ Olumlu geri bildirim kabul oranını yükseltmedi!");
    }
    console.log("✅ FeedbackEngine başarıyla doğrulandı.");

    // Test 7: SmartCache caching
    console.log('\n--- Test 7: SmartCache TTL ve Tekrarlanan Analizler ---');
    smartCache.set('test-key', 'Cached Value', 1000);
    const cachedVal = smartCache.get('test-key');
    console.log(`Cache value immediately: ${cachedVal}`);
    if (cachedVal !== 'Cached Value') {
      throw new Error("❌ Cache kaydı başarılı olmadı!");
    }
    
    // Wait for TTL expiration
    await new Promise(r => setTimeout(r, 1100));
    const expiredVal = smartCache.get('test-key');
    console.log(`Cache value after TTL expiration: ${expiredVal}`);
    if (expiredVal !== null) {
      throw new Error("❌ Süresi dolan cache verisi silinmedi!");
    }
    console.log("✅ SmartCache TTL kuralları başarıyla doğrulandı.");

    // Test 8: MultiAgentEngine integration checks
    console.log('\n--- Test 8: MultiAgentEngine Entegrasyonu ---');
    smartCache.clear();
    const result = await multiAgentEngine.executeTask("Kilo vermek ve 90 kiloya düşmek için hedef planlama yapmak istiyorum.", {
      userInput: "Kilo vermek ve 90 kiloya düşmek için hedef planlama yapmak istiyorum.",
      conversationContext: null,
      lifeSnapshot: {},
      memoryFacts: [],
      activeGoals: [],
      currentDateTime: new Date().toISOString(),
      personalityMode: 'general',
      source: 'user'
    });
    console.log("MultiAgentEngine collaborative result message:", result?.message);
    if (!result || !result.success) {
      throw new Error("❌ MultiAgentEngine entegre öğrenme akışı ile çalıştırılamadı!");
    }
    console.log("✅ MultiAgentEngine entegrasyonu başarıyla doğrulandı.");

    // Test 9: Diagnostics Verification
    console.log('\n--- Test 9: Diagnostics Doğrulaması ---');
    const diag = learningEngine.getDiagnostics();
    console.log("Learning Diagnostics:", diag);
    if (diag.tokenRemaining === undefined || diag.costMode === undefined) {
      throw new Error("❌ Diagnostics parametreleri eksik!");
    }
    console.log("✅ Diagnostics başarıyla doğrulandı.");

    // Test 10: 429 Cooldown compatibility
    console.log('\n--- Test 10: 429 Cooldown Entegrasyon Uyumu ---');
    // Mock both providers in cooldown in AIOrchestrator
    (AIOrchestrator as any).quotaExceeded.gemini = true;
    (AIOrchestrator as any).quotaExceeded.groq = true;
    
    const isSkip = costOptimizer.shouldSkipPipeline("yürüyüş yapmak", []);
    console.log(`Bypass pipeline due to both cooldowns: ${isSkip}`);
    if (!isSkip) {
      throw new Error("❌ Cooldown durumunda boru hattı bypass edilmedi!");
    }
    console.log("✅ Cooldown uyumu başarıyla doğrulandı.");

    console.log('\n======================================================');
    console.log('=== TÜM AGENT LEARNING VE OPTİMİZASYON TESTLERİ GEÇTİ ===');
    console.log('======================================================');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Test başarısız:', err);
    process.exit(1);
  }
}

runLearningTests();
