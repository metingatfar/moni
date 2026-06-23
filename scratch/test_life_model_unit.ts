/// <reference types="node" />
import { LifeModel } from '../src/core/life/LifeModel';
import { ExecutiveBrain } from '../src/core/brain/ExecutiveBrain';
import { AIOrchestrator } from '../src/core/ai/AIOrchestrator';
import { Planner } from '../src/core/planner/Planner';
import { ToolManager } from '../src/core/tools/ToolManager';
import { ShortTermMemory } from '../src/core/memory/ShortTermMemory';
import { LongTermMemory } from '../src/core/memory/LongTermMemory';
import { container } from '../src/core/container/ServiceContainer';
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

async function runLifeModelTests() {
  console.log('======================================================');
  console.log('=== STARTING MONI LIFE MODEL ENGINE UNIT TESTS ===');
  console.log('======================================================');

  // Initialize dependencies
  const aiOrch = new AIOrchestrator();
  const planner = new Planner();
  const toolManager = new ToolManager();
  const shortTermMemory = new ShortTermMemory();
  const longTermMemory = new LongTermMemory();
  const lifeModel = new LifeModel();

  // Register in container
  container.register('AIOrchestrator', aiOrch);
  container.register('Planner', planner);
  container.register('ToolManager', toolManager);
  container.register('ShortTermMemory', shortTermMemory);
  container.register('LongTermMemory', longTermMemory);
  container.register('LifeModel', lifeModel);

  // Set mock database data by calling databaseService APIs or saving directly to mock localStorage
  // 1. Save dummy memories for Metin's profile
  const mockMemories = [
    { id: 'm1', category: 'identity', content: 'Kullanıcının adı Metin.', confidence: 1.0, importance: 4 },
    { id: 'm2', category: 'health', content: 'Kullanıcı 85 kilo ağırlığında.', confidence: 0.9, importance: 3 },
    { id: 'm3', category: 'health', content: 'Tansiyonu genelde 120/80 seviyesindedir.', confidence: 0.9, importance: 3 },
    { id: 'm4', category: 'health', content: 'Her gün aspirin kullanıyor.', confidence: 1.0, importance: 4 },
    { id: 'm5', category: 'sport', content: 'Favori sporu badminton.', confidence: 0.9, importance: 3 },
    { id: 'm6', category: 'goal', content: 'Hedef 90 kilodan 80 kiloya düşmek.', confidence: 0.9, importance: 3 },
    { id: 'm7', category: 'goal', content: 'Geçen yıl sigarayı bırakma hedefine ulaştı.', confidence: 0.9, importance: 3 }
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
    // 1. Run analysis manually to load mock items
    console.log('--> Analiz motoru tetikleniyor...');
    await lifeModel.analyze(true);

    // 2. Verify Profile is populated
    console.log('\n--- LIFE PROFILE DOĞRULAMA ---');
    const profile = lifeModel.getProfile();
    console.log(`Kullanıcı Adı: ${profile.identity.name} (Beklenen: Metin)`);
    console.log(`Kilo: ${profile.health.weight} (Beklenen: 85)`);
    console.log(`Tansiyon: ${profile.health.systolicBP}/${profile.health.diastolicBP} (Beklenen: 120/80)`);
    console.log(`Kullanılan İlaçlar: ${profile.health.medications.join(', ')}`);
    console.log(`Aktif Hedefler: ${profile.goals.activeGoals.join(', ')}`);
    console.log(`Tamamlanan Hedefler: ${profile.goals.completedGoals.join(', ')}`);

    if (profile.identity.name === 'Metin' && profile.health.weight === 85) {
      console.log('✅ Life Profile başarıyla güncellendi.');
    } else {
      throw new Error('❌ Life Profile güncellenirken hata oluştu!');
    }

    // 3. Verify Snapshot is formed
    console.log('\n--- LIFE SNAPSHOT DOĞRULAMA ---');
    const snapshot = lifeModel.getSnapshot();
    console.log(`Bugünkü Kalan Görev Sayısı: ${snapshot.todayTasksCount} (Beklenen: 1)`);
    console.log(`Yaklaşan Toplantılar: ${snapshot.upcomingMeetings.join(', ')}`);
    console.log(`Hafıza Kayıt Sayısı: ${snapshot.memoryCount} (Beklenen: 7)`);

    if (snapshot.todayTasksCount === 1 && snapshot.memoryCount === 7) {
      console.log('✅ Life Snapshot başarıyla oluşturuldu.');
    } else {
      throw new Error('❌ Life Snapshot oluşum hatası!');
    }

    // 4. Verify Metrics calculation
    console.log('\n--- LIFE METRICS DOĞRULAMA ---');
    const metrics = lifeModel.getMetrics();
    console.log(`Sağlık Skoru (Health Score): ${metrics.healthScore}/100`);
    console.log(`Aktivite Skoru (Activity Score): ${metrics.activityScore}/100`);
    console.log(`Hedef İlerleme Skoru (Goal Score): ${metrics.goalProgressScore}/100`);
    console.log(`Üretkenlik Skoru (Productivity Score): ${metrics.productivityScore}/100`);
    console.log(`Genel Yaşam Skoru (Overall Life Score): ${metrics.overallLifeScore}/100`);

    if (metrics.healthScore > 0 && metrics.overallLifeScore > 0) {
      console.log('✅ Life Metrics başarıyla hesaplandı.');
    } else {
      throw new Error('❌ Skor hesaplama hatası!');
    }

    // 5. Verify ExecutiveBrain Integration
    console.log('\n--- EXECUTIVE BRAIN ENTEGRASYON DOĞRULAMA ---');
    // Simulate processInput call
    aiOrch.chatStream = async (opt: any, chunk: any) => {
      chunk("Test cevabı");
    };
    await brain.processInput("Merhaba Moni, nasılsın?", () => {});
    const brainSnapshot = lifeModel.getSnapshot();
    console.log(`Brain üzerinden okunan son konuşma konusu: ${brainSnapshot.lastConversationTopic}`);

    // 6. Verify Diagnostics output
    console.log('\n--- DIAGNOSTICS DOĞRULAMA ---');
    const diagnostics = lifeModel.getDiagnostics();
    console.log(`Profil Tamlık Yüzdesi: ${diagnostics.profileCompleteness}%`);
    console.log(`Snapshot Boyutu: ${diagnostics.snapshotSize} bytes`);
    console.log(`Son Snapshot Zamanı: ${diagnostics.lastSnapshotTime}`);

    console.log('\n======================================================');
    console.log('=== TÜM LIFE MODEL TESTLERİ BAŞARIYLA TAMAMLANDI ===');
    console.log('======================================================');
    process.exit(0);
  } catch (err: any) {
    console.error('Test hatası:', err);
    process.exit(1);
  }
}

runLifeModelTests();
