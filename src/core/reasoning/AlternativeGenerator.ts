export interface DecisionAlternative {
  planName: string;
  advantages: string[];
  disadvantages: string[];
  complexity: 'low' | 'medium' | 'high';
  estimatedDurationMs: number;
  estimatedCost: number; // 0 to 100
  confidence: number;
}

export class AlternativeGenerator {
  public generateAlternatives(intentType: string): DecisionAlternative[] {
    const list: DecisionAlternative[] = [];

    if (intentType === 'project_planning') {
      list.push({
        planName: 'Plan A: Aşamalı Entegrasyon & Goal/Workflow Kurulumu',
        advantages: ['Mevcut Goal ve Workflow altyapısını tam kullanır', 'Güvenli ve yapılandırılmış ilerleme sunar'],
        disadvantages: ['İlk kurulum ve planlama süresi biraz uzundur'],
        complexity: 'medium',
        estimatedDurationMs: 90000,
        estimatedCost: 20,
        confidence: 0.9
      });
      list.push({
        planName: 'Plan B: Doğrudan İnternet Araştırması & Raporlama',
        advantages: ['Hızlı ve en güncel teknik verileri getirir'],
        disadvantages: ['Yerel hafıza ve alışkanlıkları göz ardı edebilir', 'API maliyeti yüksektir'],
        complexity: 'low',
        estimatedDurationMs: 40000,
        estimatedCost: 60,
        confidence: 0.7
      });
      return list;
    }

    if (intentType === 'checklist_reminder') {
      list.push({
        planName: 'Plan A: Hatırlatıcı Kurulması & Çanta Kontrol Listesi',
        advantages: ['Kullanıcıyı doğru zamanda uyarır', 'Malzemelerin unutulmasını engeller'],
        disadvantages: ['Kullanıcı onayı gerektirir'],
        complexity: 'low',
        estimatedDurationMs: 15000,
        estimatedCost: 5,
        confidence: 0.95
      });
      list.push({
        planName: 'Plan B: Sadece Takvim Etkinliği Oluşturulması',
        advantages: ['Takvimde yer ayırır'],
        disadvantages: ['Anlık malzeme kontrol uyarısı vermez'],
        complexity: 'low',
        estimatedDurationMs: 20000,
        estimatedCost: 10,
        confidence: 0.8
      });
      return list;
    }

    // Default alternatives
    list.push({
      planName: 'Plan A: Doğal Dilde Yanıt & Yerel Bilgi Kullanımı',
      advantages: ['Hızlıdır, API maliyeti oluşturmaz'],
      disadvantages: ['Statik yerel bilgilerle sınırlıdır'],
      complexity: 'low',
      estimatedDurationMs: 5000,
      estimatedCost: 0,
      confidence: 0.9
    });

    return list;
  }
}
