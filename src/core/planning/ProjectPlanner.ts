export interface PlannedProject {
  id: string;
  title: string;
  modules: {
    id: string;
    name: string;
    description: string;
    milestones: string[];
  }[];
}

export class ProjectPlanner {
  public decomposeProject(title: string): PlannedProject {
    const id = 'proj-' + Date.now();
    const lower = title.toLowerCase();

    if (lower.includes('fithayat')) {
      return {
        id,
        title: 'FitHayat Geliştirme Projesi',
        modules: [
          {
            id: 'mod-auth',
            name: 'Kullanıcı Yetkilendirme & Kayıt',
            description: 'OAuth ve yerel veritabanı şifreleme altyapısının kurulması.',
            milestones: ['Temel DB Şeması', 'Login/Register Arayüzleri', 'Token Yönetimi']
          },
          {
            id: 'mod-workout',
            name: 'Egzersiz & Antrenman Takip',
            description: 'Kullanıcının spor aktivitelerini planlayıp kaydedeceği motor.',
            milestones: ['Aktivite Tipleri Tanımlama', 'Kalori Hesaplama Algoritması', 'Haftalık Spor Raporu']
          },
          {
            id: 'mod-nutrition',
            name: 'Beslenme & Su Takibi',
            description: 'Günlük kalori ve makro değerlerinin, su tüketiminin kaydedilmesi.',
            milestones: ['Besin Kütüphanesi', 'Barkod Tarayıcı Entegrasyonu', 'Su Tüketim Alarmı']
          }
        ]
      };
    }

    // Default project fallback
    return {
      id,
      title: title || 'Genel Proje Planı',
      modules: [
        {
          id: 'mod-init',
          name: 'Başlangıç Analizi & Altyapı',
          description: 'Gereksinim analizi ve mimari altyapı kurulumu.',
          milestones: ['Gereksinim Raporu', 'Proje Başlatma']
        },
        {
          id: 'mod-dev',
          name: 'Geliştirme & Entegrasyon',
          description: 'Çekirdek modüllerin kodlanması.',
          milestones: ['Kodlama', 'Test Suite Hazırlama']
        }
      ]
    };
  }
}
