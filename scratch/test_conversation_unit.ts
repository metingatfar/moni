/// <reference types="node" />
import { ExecutiveBrain } from '../src/core/brain/ExecutiveBrain';
import { AIOrchestrator } from '../src/core/ai/AIOrchestrator';
import { Planner } from '../src/core/planner/Planner';
import { ToolManager } from '../src/core/tools/ToolManager';
import { ShortTermMemory } from '../src/core/memory/ShortTermMemory';
import { LongTermMemory } from '../src/core/memory/LongTermMemory';
import { container } from '../src/core/container/ServiceContainer';
import { ConversationEngine } from '../src/core/conversation/ConversationEngine';

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

// Set backend API URL for AIOrchestrator
g.process.env.VITE_BACKEND_API_URL = 'http://localhost:5000/api';

async function runConversationTests() {
  console.log('======================================================');
  console.log('=== STARTING MONI CONVERSATION INTELLIGENCE TESTS ===');
  console.log('======================================================');

  // Initialize dependencies
  const aiOrch = new AIOrchestrator();
  
  // MOCK chatComplete for deterministic test flows without API limits
  aiOrch.chatComplete = async (options: any): Promise<string> => {
    const msg = options.message;
    const msgLower = msg.toLowerCase();
    
    // 1. Reference resolution for Senaryo 1
    if (msgLower.includes("işaret zamirlerini") && msgLower.includes("onu yarın teslim alacağım")) {
      return "Arabayı yarın teslim alacağım.";
    }
    
    // 2. Reference resolution for Senaryo 2 (Ambiguity check)
    if (msgLower.includes("işaret zamirlerini") && msgLower.includes("oraya ne zaman gideceğiz")) {
      return "CLARIFY: Oraya derken nereyi kastediyorsun?";
    }
    
    // 3. Slot extraction for Senaryo 3 (Meeting planning)
    if (msgLower.includes("slot") && msgLower.includes("toplantı planla")) {
      return JSON.stringify({
        title: "Toplantı",
        time: null,
        participants: null,
        location: null
      });
    }
    if (msgLower.includes("slot") && msgLower.includes("yarın saat 10:00'da")) {
      return JSON.stringify({
        title: "Toplantı",
        time: "Yarın saat 10:00'da",
        participants: null,
        location: null
      });
    }
    if (msgLower.includes("slot") && msgLower.includes("ahmet ve mehmet katılsın")) {
      return JSON.stringify({
        title: "Toplantı",
        time: "Yarın saat 10:00'da",
        participants: ["Ahmet", "Mehmet"],
        location: null
      });
    }
    if (msgLower.includes("slot") && msgLower.includes("ofiste")) {
      return JSON.stringify({
        title: "Toplantı",
        time: "Yarın saat 10:00'da",
        participants: ["Ahmet", "Mehmet"],
        location: "Ofiste"
      });
    }
    
    // 4. Meeting final confirmation response creation
    if (msgLower.includes("toplantı başarıyla oluşturuldu")) {
      return "Toplantıyı yarın saat 10'da Ahmet ve Mehmet ile ofiste olacak şekilde planladım.";
    }

    // 5. Implicit Memory extraction / Saving
    if (msgLower.includes("adım metin") || msgLower.includes("projemin adı moni") || msgLower.includes("react ile yazıldı") || msgLower.includes("hafta içinde bitirmeliyim")) {
      if (msgLower.includes("adım metin")) {
        return JSON.stringify({ save: true, category: "identity", content: "Kullanıcının adı Metin.", confidence: 1.0, importance: 4 });
      }
      if (msgLower.includes("projemin adı moni")) {
        return JSON.stringify({ save: true, category: "work", content: "Kullanıcının yeni projesinin adı Moni'dir.", confidence: 0.9, importance: 3 });
      }
      if (msgLower.includes("react ile yazıldı")) {
        return JSON.stringify({ save: true, category: "work", content: "Moni projesi React ve Node.js kullanılarak yazılmıştır.", confidence: 0.9, importance: 3 });
      }
      if (msgLower.includes("hafta içinde bitirmeliyim")) {
        return JSON.stringify({ save: true, category: "goal", content: "Kullanıcının hedefi projeyi 2 hafta içinde bitirmektir.", confidence: 0.9, importance: 3 });
      }
    }

    // 6. Summary generation
    if (msgLower.includes("konuşma geçmişini") && msgLower.includes("özetle")) {
      if (msg.includes("Metin") || msg.includes("Moni")) {
        return "Kullanıcı adının Metin olduğunu, yeni projesi Moni'nin React ve Node.js ile yazıldığını ve 2 hafta içinde bitirmeyi hedeflediğini belirtti.";
      }
      return "Özetlenecek önemli bir bilgi konuşulmadı.";
    }

    // If it is asking for JSON structure extraction (implicit memory check fallback)
    if (msgLower.includes("kategori_adi")) {
      return JSON.stringify({ save: false });
    }

    return "Mocked chatComplete Response";
  };

  // MOCK chatStream
  aiOrch.chatStream = async (options: any, onChunk: (chunk: string) => void): Promise<void> => {
    const msg = options.message;
    const msgLower = msg.toLowerCase();
    
    let reply = "Mocked chatStream response.";
    if (msgLower.includes("bugün yeni bir araba aldım")) {
      reply = "Hayırlı olsun, ne marka araba aldın?";
    } else if (msgLower.includes("arabayı yarın teslim alacağım")) {
      reply = "Harika, teslim aldıktan sonra yollarda keyifli sürüşler dilerim.";
    } else if (msgLower.includes("bugün havuzda yüzmeye gittim")) {
      reply = "Harika! Yüzmek harika bir egzersizdir.";
    } else if (msgLower.includes("çok yoruldum")) {
      reply = "Yüzmeden dolayı yorulmuş olabilirsin, dinlenmek iyi gelecektir.";
    } else if (msgLower.includes("nasılsın")) {
      reply = "Harikayım, sana nasıl yardımcı olabilirim?";
    } else if (msgLower.includes("hava çok güzel")) {
      reply = "Evet, bugün hava dışarı çıkmak için çok güzel.";
    }
    
    onChunk(reply);
  };

  const planner = new Planner();
  const toolManager = new ToolManager();
  const shortTermMemory = new ShortTermMemory();
  const longTermMemory = new LongTermMemory();
  const conversationEngine = new ConversationEngine(aiOrch);

  // Register in container so ExecutiveBrain can resolve it
  container.register('AIOrchestrator', aiOrch);
  container.register('Planner', planner);
  container.register('ToolManager', toolManager);
  container.register('ShortTermMemory', shortTermMemory);
  container.register('LongTermMemory', longTermMemory);
  container.register('ConversationEngine', conversationEngine);

  // Register tools that are needed (e.g. reminders)
  const { ReminderTool } = await import('../src/core/tools/ReminderTool');
  toolManager.registerTool(new ReminderTool());

  const brain = new ExecutiveBrain(
    aiOrch,
    planner,
    toolManager,
    shortTermMemory,
    longTermMemory,
    'Metin'
  );

  // Helper to run pipeline and print interaction
  async function testSentence(input: string) {
    console.log(`\n👤 Kullanıcı: "${input}"`);
    let response = '';
    await brain.processInput(input, (chunk) => {
      response += chunk;
    });
    console.log(`🤖 MONI: "${response}"`);
    return response;
  }

  try {
    // Wait for systems to settle
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n--- SENARYO 1: Referans Çözümleme (Pronoun Resolution) ---');
    await testSentence("Bugün yeni bir araba aldım.");
    await testSentence("Onu yarın teslim alacağım."); // "Onu" -> "Arabayı"

    console.log('\n--- SENARYO 2: Belirsizlik Durumunda Netleştirme Sorusu ---');
    conversationEngine.history.clear();
    conversationEngine.context.resetMultiTurn();
    await testSentence("Oraya ne zaman gideceğiz?"); // Ambiguous reference -> should trigger CLARIFY

    console.log('\n--- SENARYO 3: Multi-turn Toplantı Akışı (Slot Filling) ---');
    conversationEngine.history.clear();
    conversationEngine.context.resetMultiTurn();
    await testSentence("Toplantı planla");
    await testSentence("Yarın saat 10:00'da");
    await testSentence("Ahmet ve Mehmet katılsın");
    await testSentence("Ofiste");

    console.log('\n--- SENARYO 4: Konuşma Konusu Takibi (Topic Tracking) ---');
    conversationEngine.history.clear();
    conversationEngine.context.resetMultiTurn();
    conversationEngine.context.setTopic('chat');
    await testSentence("Bugün havuzda yüzmeye gittim.");
    console.log(`[Aktif Konu]: ${conversationEngine.context.currentTopic}`);
    await testSentence("Çok yoruldum."); // Active topic remains sport

    console.log('\n--- SENARYO 5: Otomatik Özetleme ve Hafıza Filtreleme ---');
    conversationEngine.history.clear();
    // Fill up history to 6 messages with transient chat
    await testSentence("Nasılsın Moni?");
    await testSentence("İyiyim, sen nasılsın?");
    await testSentence("Ben de iyiyim.");
    await testSentence("Harika görünüyor.");
    await testSentence("Bugün hava çok güzel.");
    await testSentence("Evet, dışarı çıkmak için harika bir gün."); // Should trigger summary, but because it's transient it shouldn't save to LongTermMemory.
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Hafızadaki Kayıt Sayısı: ${longTermMemory.getFacts().length}`);
    
    // Now trigger with meaningful facts
    conversationEngine.history.clear();
    await testSentence("Benim adım Metin.");
    await testSentence("Yeni projemin adı Moni.");
    await testSentence("Moni React ile yazıldı.");
    await testSentence("Bu projeyi 2 hafta içinde bitirmeliyim.");
    await testSentence("İşler çok yoğun gidiyor.");
    await testSentence("Bugün planlama yapmamız lazım."); // Trigger summary
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Hafızadaki Kayıt Sayısı: ${longTermMemory.getFacts().length}`);
    console.log('Kayıtlar:');
    longTermMemory.getFacts().forEach(f => {
      console.log(`- [${f.category}]: "${f.content}"`);
    });

    console.log('\n======================================================');
    console.log('=== TÜM TESTLER TAMAMLANDI ===');
    console.log('======================================================');
    process.exit(0);
  } catch (err: any) {
    console.error('Test sırasında hata oluştu:', err);
    process.exit(1);
  }
}

runConversationTests();
