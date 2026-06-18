# PROJE ADI: MONI (Yapay Zeka Destekli Akıllı Kişisel Asistan - Versiyon 3)
# ROL: Kıdemli Mobil/Web Geliştirici, AI Prompt Mühendisi ve DevOps Uzmanı

Bu dosya, MONI projesinin geliştirilmesinde kullanılacak **nihai sistem yönergesi, çoklu ses parametreleri ve teknik mimari dökümanıdır**. Geliştirici modeller (LLM) veya yazılımcılar bu dökümanı referans alarak projeyi inşa etmelidir.

---

## 1. SOHBET AKIŞI VE DOĞALLIK PROTOKOLÜ
*   **Teknik İbarelerin Temizlenmesi:** Yapay zeka çıktı üretirken asla `[ONLINE MODE]`, `[OFFLINE MODE]`, `[SYSTEM]` gibi teknik etiketleri sesli veya yazılı cevaba dahil etmeyecektir.
*   **Akıllı Selamlama (Session Management):** MONI, kullanıcı uygulamayı ilk açtığında veya uzun süre sonra ilk kez konuştuğunda doğal bir selamlama yapacak ("Merhaba, nasıl yardımcı olabilirim?"). Ancak kullanıcı cevap verip sohbet devam ederken her mesajda "Ben MONI" diyerek kendini tekrar etmeyecektir. Diyaloglar akıcı, kısa ve net (tam bir özel kalem gibi) olacaktır.

---

## 2. ÇOKLU SES (TTS) VE KARAKTER GEREKSİNİMLERİ
MONI için Türkçe (`tr-TR`) ses profilleri kodlanmıştır. TTS motorunda bu seslerin cinsiyet (Female), Pitch (Ses perdesi) ve Rate (Konuşma hızı) ayarları dinamik olarak yönetilir:
1. **Selin (Kadın):** Kurumsal, ciddi ve net özel kalem tonu.
   - *Frekans Ayarları:* Pitch: `1.05`, Rate: `1.0` (Standart/Ciddi)
2. **Derin (Kadın):** Günlük sohbete uygun, sıcak ve doğal ton.
   - *Frekans Ayarları:* Pitch: `1.25`, Rate: `0.95` (Tiz/Sıcak)

---

## 3. TEKNİK MİMARİ & KLASÖR YAPISI (CLEAN ARCHITECTURE)

Proje, sürdürülebilirlik ve test edilebilirlik için **Clean Architecture** prensiplerine uygun olarak şu klasör yapısında kurulmuştur:

```text
moni/
├── src/
│   ├── domain/               # İş Mantığı (Business Logic) & Soyutlamalar
│   │   ├── entities/         # Temel veri modelleri (Contact, Reminder, Message)
│   │   └── repositories/     # Repository arayüz tanımları (Portlar)
│   ├── data/                 # Veri Kaynakları & Servis Entegrasyonları (Adapters)
│   │   ├── db/               # Local DB işlemleri (localStorage, IndexedDB, Hive vb.)
│   │   └── services/         # Local AI, Voice (STT/TTS) ve Native Bridge servisleri
│   └── presentation/         # Kullanıcı Arayüzü & Görsel Katman
│       ├── components/       # Ortak görsel bileşenler
│       ├── hooks/            # Custom React hook'lar
│       └── MoniDashboard.tsx # Ana kontrol paneli ve asistan arayüzü
├── Dockerfile                # Bulut dağıtım (deploy) konteyner ayarları
├── .env.example              # Ortam değişkenleri şablonu
├── render.yaml               # Render.com hızlı kurulum ayarları
├── vite.config.ts            # Proje konfigürasyonu (Port: 3001)
└── package.json              # Bağımlılıklar ve scriptler
```

---

## 4. AKILLI OTURUM YÖNETİMİ VE SES MOTORU KOD BLOKLARI

### Adım 1: Sohbet Akışı ve Durum Yönetimi (Session Manager)
Oturumun ilk mesajını kontrol edip akıcı ve doğal cevap üreten LLM yapısı:

```typescript
// src/data/services/LocalAiService.ts
import type { AiRepository, Message } from '../../domain/repositories/AiRepository';

export class LocalAiService implements AiRepository {
  async generateResponse(messages: Message[], useOfflineMode: boolean): Promise<string> {
    const userMessages = messages.filter(m => m.role === 'user');
    const isFirstMessage = userMessages.length <= 1; // Oturumun ilk mesajı mı?
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
    
    // Doğal cevap simülasyonu (Bulutta gelişmiş LLM sistemi ile değiştirilir)
    let baseResponse = `Talebinizle ilgileniyorum. "${lastUserMessage}" konusu hakkında başka yapmamı istediğiniz bir şey var mı?`;
    
    if (useOfflineMode) {
      return isFirstMessage 
        ? `Merhaba, ben asistanınız Moni. İnternet bağlantımız olmasa da yerel olarak hizmetinizdeyim. ${baseResponse}`
        : baseResponse;
    }

    return isFirstMessage 
      ? `Merhaba, ben asistanınız Moni. Nasıl yardımcı olabilirim? ${baseResponse}`
      : baseResponse;
  }
}
```

### Adım 2: Dinamik Ses Yönetim Servisi (VoiceManager)
Seçilen ses karakterine göre TTS frekanslarını yöneten ve seslendirme yapan yapı:

```typescript
// src/presentation/MoniDashboard.tsx (TTS Bölümü)
const speakText = (text: string, selectedVoice: string, trVoicesList: SpeechSynthesisVoice[]) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const femaleVoices = trVoicesList.filter(v => v.name.toLowerCase().match(/(dilara|yelda|female|google|seda)/));
    const maleVoices = trVoicesList.filter(v => v.name.toLowerCase().match(/(tolga|cem|male|can|hakan)/));
    const defaultVoice = trVoicesList[0];

    switch (selectedVoice) {
      case 'selin': // Kurumsal kadın
        utterance.voice = trVoicesList.find(v => v.name.toLowerCase().includes('dilara')) || femaleVoices[0] || defaultVoice || null;
        utterance.pitch = 1.05;
        utterance.rate = 1.0;
        break;
      case 'derin': // Doğal kadın
        utterance.voice = femaleVoices.find(v => v.name.toLowerCase().includes('google')) || femaleVoices[1] || femaleVoices[0] || defaultVoice || null;
        utterance.pitch = 1.25;
        utterance.rate = 0.95;
        break;
    }
    window.speechSynthesis.speak(utterance);
  }
};
```

---

## 5. DAĞITIM VE DEPLOYMENT POLİTİKASI
Web uygulamasının ücretsiz Render veya Railway gibi platformlara dockerize edilerek tek tıkla yüklenmesi için proje kök dizininde yer alan `Dockerfile` ve `render.yaml` dosyaları kullanılır.
- **Vite Dev Sunucusu Portu:** `3001` (StrictPort modunda)
- **Render Üretim Sunucusu Portu:** `3001` (Docker konteyneri içinde)