import type { TestScenario } from './TestScenario';
import type { TestResult } from './TestResult';

export class RegressionSuite {
  private scenarios: TestScenario[] = [
    {
      id: 'reg-01',
      name: 'Merhaba Moni',
      description: 'Basit selamlaşma testi',
      module: 'Conversation',
      expected: 'Merhaba',
      timeout: 1000,
      severity: 'low',
      enabled: true
    },
    {
      id: 'reg-02',
      name: 'Nasılsın',
      description: 'Hal hatır sorma',
      module: 'Conversation',
      expected: 'iyiyim',
      timeout: 1000,
      severity: 'low',
      enabled: true
    },
    {
      id: 'reg-03',
      name: 'Kahveyi şekersiz içerim',
      description: 'Kişisel tercih hafızaya alma testi',
      module: 'Memory',
      expected: 'hafızama kaydettim',
      timeout: 1000,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'reg-04',
      name: 'Ben kahveyi nasıl içerim',
      description: 'Hafızadan bilgi çağırma testi',
      module: 'Memory',
      expected: 'şekersiz',
      timeout: 1000,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'reg-05',
      name: 'Arabam bozuldu',
      description: 'Problem bildirme',
      module: 'Conversation',
      expected: 'geçmiş olsun',
      timeout: 1000,
      severity: 'low',
      enabled: true
    },
    {
      id: 'reg-06',
      name: 'Onu servise götüreceğim',
      description: 'İlişkili aksiyon planı',
      module: 'Conversation',
      expected: 'yardımcı olabilirim',
      timeout: 1000,
      severity: 'low',
      enabled: true
    },
    {
      id: 'reg-07',
      name: 'Bugün yüzmeye gittim',
      description: 'Aktivite girişi',
      module: 'LifeModel',
      expected: 'yüzme',
      timeout: 1500,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'reg-08',
      name: 'Çok yoruldum',
      description: 'Durum güncelleme (yorgunluk)',
      module: 'LifeModel',
      expected: 'dinlenmelisiniz',
      timeout: 1500,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'reg-09',
      name: '90 kiloya düşmek istiyorum',
      description: 'Kilo hedefi oluşturma',
      module: 'Goal',
      expected: 'hedef',
      timeout: 2000,
      severity: 'high',
      enabled: true
    },
    {
      id: 'reg-10',
      name: 'Bugünkü hedeflerim',
      description: 'Bugünkü hedefleri listeleme',
      module: 'Goal',
      expected: 'hedef',
      timeout: 1500,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'reg-11',
      name: 'Her pazartesi kilomu sor',
      description: 'Haftalık yinelenen iş akışı',
      module: 'Workflow',
      expected: 'iş akışı',
      timeout: 2000,
      severity: 'high',
      enabled: true
    },
    {
      id: 'reg-12',
      name: 'Her akşam ilaçlarımı hatırlat',
      description: 'Yinelenen hatırlatıcı iş akışı',
      module: 'Workflow',
      expected: 'iş akışı',
      timeout: 2000,
      severity: 'high',
      enabled: true
    },
    {
      id: 'reg-13',
      name: 'Bugün çok yorgunum ama spor yapmak istiyorum',
      description: 'Çelişki çözümü testi (Health vs Fitness)',
      module: 'MultiAgent',
      expected: 'hafif',
      timeout: 2000,
      severity: 'critical',
      enabled: true
    },
    {
      id: 'reg-14',
      name: 'Güzel öneri',
      description: 'Pozitif geri bildirim testi',
      module: 'Learning',
      expected: 'teşekkürler',
      timeout: 1000,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'reg-15',
      name: 'Bu işe yaramadı',
      description: 'Negatif geri bildirim testi',
      module: 'Learning',
      expected: 'kaydettim',
      timeout: 1000,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'reg-16',
      name: 'Bana günlük brifing ver',
      description: 'Günlük brifing sorgusu',
      module: 'Conversation',
      expected: 'brifing',
      timeout: 1500,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'reg-17',
      name: 'Risk var mı',
      description: 'Sağlık / Genel risk kontrolü',
      module: 'LifeModel',
      expected: 'risk',
      timeout: 1500,
      severity: 'high',
      enabled: true
    },
    {
      id: 'reg-18',
      name: 'Bu hafta nasıl gidiyorum',
      description: 'Haftalık gelişim özeti',
      module: 'Goal',
      expected: 'haftalık',
      timeout: 1500,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'reg-19',
      name: 'Toplantı oluştur',
      description: 'Ajanda/Takvim oluşturma tetikleyici',
      module: 'Conversation',
      expected: 'toplantı',
      timeout: 1500,
      severity: 'high',
      enabled: true
    },
    {
      id: 'reg-20',
      name: 'Yarın saat 14',
      description: 'Zaman detaylandırma',
      module: 'Conversation',
      expected: '14',
      timeout: 1000,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'reg-21',
      name: 'Ali katılsın',
      description: 'Katılımcı ekleme',
      module: 'Conversation',
      expected: 'Ali',
      timeout: 1000,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'reg-22',
      name: 'Bolu olsun',
      description: 'Lokasyon ekleme',
      module: 'Conversation',
      expected: 'Bolu',
      timeout: 1000,
      severity: 'medium',
      enabled: true
    }
  ];

  public getScenarios(): TestScenario[] {
    return this.scenarios;
  }

  public async runRegression(
    executeInput: (input: string) => Promise<string>
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const scenario of this.scenarios) {
      if (!scenario.enabled) {
        results.push({
          testName: scenario.name,
          module: scenario.module,
          status: 'skipped',
          expected: scenario.expected,
          actual: 'Skipped',
          durationMs: 0,
          severity: scenario.severity,
          timestamp: new Date().toISOString()
        });
        continue;
      }

      const start = Date.now();
      try {
        const actual = await executeInput(scenario.name);
        const duration = Date.now() - start;
        const passed = actual.toLowerCase().includes(scenario.expected.toLowerCase()) || 
                       scenario.expected.split(' ').some(word => actual.toLowerCase().includes(word.toLowerCase()));

        results.push({
          testName: scenario.name,
          module: scenario.module,
          status: passed ? 'passed' : 'failed',
          expected: scenario.expected,
          actual: actual.substring(0, 100),
          durationMs: duration,
          severity: scenario.severity,
          timestamp: new Date().toISOString()
        });
      } catch (err: any) {
        results.push({
          testName: scenario.name,
          module: scenario.module,
          status: 'failed',
          expected: scenario.expected,
          actual: 'Error: ' + err.message,
          durationMs: Date.now() - start,
          error: err.message,
          severity: scenario.severity,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }
}

export const regressionSuite = new RegressionSuite();
