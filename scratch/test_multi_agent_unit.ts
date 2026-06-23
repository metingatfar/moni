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
import { LearningAgent } from '../src/core/agents/LearningAgent';
import { GoalTool } from '../src/core/tools/GoalTool';
import { goalEngine } from '../src/core/goals/GoalEngine';
import { workflowEngine } from '../src/core/workflows/WorkflowEngine';
import { multiAgentEngine } from '../src/core/collaboration/MultiAgentEngine';

async function runMultiAgentTests() {
  console.log('======================================================');
  console.log('=== STARTING MONI MULTI-AGENT COLLABORATION TESTS ===');
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

  // Clear previous registry and register all agents
  agentRegistry.clear();
  agentRegistry.register(new GoalAgent());
  agentRegistry.register(new HealthAgent());
  agentRegistry.register(new FitnessAgent());
  agentRegistry.register(new NotificationAgent());
  agentRegistry.register(new LearningAgent());

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

    // Test 1: Single Agent routing fallback
    console.log('\n--- Test 1: Tek Agent / Fallback İşlemleri ---');
    const resp1 = await testSentence("Merhaba MONI nasılsın?");
    if (resp1.includes("UYARI") || resp1.includes("Ajanlar")) {
      throw new Error("❌ Normal sohbette MultiAgentEngine devreye girdi!");
    }
    console.log("✅ Tek agent / fallback başarıyla doğrulandı.");

    // Test 2: Multiple agents (Goal + Health + Fitness) collaboration routing
    console.log('\n--- Test 2: Birden Fazla Ajan (Multi-Agent Routing) Entegrasyonu ---');
    const resp2 = await testSentence("Kilo vermek ve 90 kiloya düşmek için hedef planlama yapmak istiyorum.");
    if (!resp2.includes("[goal_agent]") || !resp2.includes("[health_agent]") || !resp2.includes("[fitness_agent]")) {
      throw new Error("❌ Ajanlar arası iş birliği cevabı eksik veya hatalı!");
    }
    console.log("✅ Birden fazla ajanın birlikte çalışması başarıyla doğrulandı.");

    // Test 3: Risk warnings prepended in Consensus
    console.log('\n--- Test 3: Consensus & Risk Analizi (Risk Warn Prepend) ---');
    const resp3 = await testSentence("Bugün yorgun hissediyorum ama spor yapmak istiyorum.");
    if (!resp3.includes("[UYARI]")) {
      throw new Error("❌ Risk uyarısı consensus tarafından eklenmedi!");
    }
    console.log("✅ Consensus risk uyarıları başarıyla doğrulandı.");

    // Test 4: Duplicate Action Prevention
    console.log('\n--- Test 4: Mükerrer Aksiyon Engelleme (Duplicate Action Prevention) ---');
    // Inject custom mock votes with duplicate actions directly to consensus
    const consensus = (multiAgentEngine as any).consensus;
    const initialPrevCount = consensus.getDuplicatePreventedCount();
    
    const mockVotes = [
      {
        agentId: 'fitness_agent',
        confidence: 0.8,
        summary: 'Yürüyüş planlandı.',
        risk: '',
        suggestedActions: [
          { tool: 'tasks', params: { title: 'Günlük yürüyüş yap', priority: 'medium' } }
        ],
        executionTime: 10
      },
      {
        agentId: 'health_agent',
        confidence: 0.9,
        summary: 'Egzersiz önerildi.',
        risk: '',
        suggestedActions: [
          { tool: 'tasks', params: { title: 'Günlük yürüyüş yap', priority: 'medium' } } // DUPLICATE ACTION
        ],
        executionTime: 12
      }
    ];

    const consensusResult = consensus.resolve(mockVotes);
    console.log("Consensus Suggested Actions Count:", consensusResult.toolCalls.length);
    console.log("Duplicates prevented count difference:", consensus.getDuplicatePreventedCount() - initialPrevCount);
    
    if (consensusResult.toolCalls.length !== 1) {
      throw new Error("❌ Mükerrer aksiyon engellenemedi!");
    }
    console.log("✅ Mükerrer aksiyon engelleme başarıyla doğrulandı.");

    // Test 5: Fallback on Low Confidence
    console.log('\n--- Test 5: Düşük Güven Durumunda Fallback ---');
    const lowConfVote = [
      {
        agentId: 'goal_agent',
        confidence: 0.2, // Too low
        summary: 'Belirsiz durum.',
        risk: '',
        suggestedActions: [],
        executionTime: 5
      }
    ];
    const lowConfResult = consensus.resolve(lowConfVote);
    if (lowConfResult.confidence >= 0.5) {
      throw new Error("❌ Düşük güvenli sonucun confidence değeri hatalı yüksek!");
    }
    console.log("✅ Düşük güven durumunda fallback başarıyla doğrulandı.");

    // Test 6: Timeout protection
    console.log('\n--- Test 6: Timeout Koruması ---');
    // Modify one agent execution to take very long time and verify pipeline handles it
    const slowAgent = {
      id: 'slow_agent',
      name: 'SlowAgent',
      description: 'Slow testing agent',
      capabilities: [],
      execute: async () => {
        await new Promise(r => setTimeout(r, 4500)); // takes 4.5 seconds (exceeds pipeline 3s limit)
        return { confidence: 0.9, message: 'Done slow' };
      },
      canHandle: async () => true,
      getDiagnostics: () => {}
    };
    agentRegistry.register(slowAgent as any);
    
    const pipeline = (multiAgentEngine as any).pipeline;
    const task = {
      id: 'test-timeout',
      input: 'yürüyüş yapmak',
      intent: 'test',
      context: { userInput: 'yürüyüş yapmak' } as any,
      requiredAgents: ['fitness_agent', 'slow_agent'],
      priority: 'medium' as const,
      createdAt: new Date().toISOString()
    };
    
    console.log("Running pipeline with slow agent (expect timeout warnings)...");
    const votesFromPipe = await pipeline.run(task);
    console.log(`Pipeline returned ${votesFromPipe.length} votes.`);
    const slowAgentVote = votesFromPipe.find((v: any) => v.agentId === 'slow_agent');
    if (slowAgentVote) {
      throw new Error("❌ Yavaş çalışan ajan zaman aşımına uğramadı!");
    }
    console.log("✅ Yavaş çalışan ajan için timeout başarıyla uygulandı.");

    // Test 7: Diagnostics Output
    console.log('\n--- Test 7: Diagnostics Doğrulaması ---');
    const diag = multiAgentEngine.getDiagnostics();
    console.log("Multi-Agent Diagnostics:", diag);
    if (diag.registeredAgentsCount !== 6) { // Goal, Health, Fitness, Notification, Learning + SlowAgent
      throw new Error("❌ Diagnostics kayıtlı ajan sayısı uyuşmuyor!");
    }
    console.log("✅ Diagnostics başarıyla doğrulandı.");

    console.log('\n======================================================');
    console.log('=== TÜM MULTI-AGENT COLLABORATION TESTLERİ GEÇTİ ===');
    console.log('======================================================');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Test başarısız:', err);
    process.exit(1);
  }
}

runMultiAgentTests();
