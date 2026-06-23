import type { ChatMessage } from '../ai/LLMProvider';
import type { ConversationTopic } from './ConversationTopic';
import type { PendingSlots } from './ConversationContext';
import { AIOrchestrator } from '../ai/AIOrchestrator';

export class ConversationAnalyzer {
  private aiOrchestrator: AIOrchestrator;

  constructor(aiOrchestrator: AIOrchestrator) {
    this.aiOrchestrator = aiOrchestrator;
  }

  /**
   * Simple keyword-based topic detection
   */
  public detectTopic(text: string): ConversationTopic {
    const textLower = text.toLowerCase();

    const topicKeywords: Record<Exclude<ConversationTopic, 'chat'>, string[]> = {
      sport: ['yüzme', 'badminton', 'koşu', 'antrenman', 'futbol', 'basketbol', 'spor', 'egzersiz', 'yüzdüm', 'koştum', 'idman', 'yürüyüş'],
      vehicle: ['araba', 'servis', 'yağ', 'motor', 'lastik', 'tamir', 'bozuldu', 'oto', 'araç', 'egzoz', 'otobil'],
      health: ['ilaç', 'doktor', 'hasta', 'ağrı', 'sağlık', 'hastayım', 'grip', 'öksürük', 'ağrıyor', 'reçete', 'hastane', 'eczane'],
      work: ['iş', 'proje', 'çalışma', 'toplantı', 'kod', 'görev', 'ofis', 'şirket', 'yazılım', 'rapor', 'sunum', 'kodlama'],
      relationship: ['ali', 'zeynep', 'veli', 'arkadaş', 'eş', 'baba', 'anne', 'kardeş', 'sevgili', 'müdür', 'ortak', 'patron'],
      routine: ['rutin', 'alışkanlık', 'her gün', 'her sabah', 'genelde', 'her akşam', 'her hafta'],
      goal: ['hedef', 'kilo', 'amaç', 'zayıflamak', 'düşmek', 'ulaşmak'],
      location: ['bolu', 'istanbul', 'ankara', 'adres', 'ev', 'konum', 'yer', 'ofis', 'mekan']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(k => textLower.includes(k))) {
        return topic as ConversationTopic;
      }
    }

    return 'chat';
  }

  /**
   * Reference Resolver using LLM
   */
  public async resolveReferences(text: string, history: ChatMessage[]): Promise<string> {
    const textLower = text.toLowerCase();
    const pronouns = ['onu', 'bunu', 'şunu', 'orada', 'burada', 'yarınki', 'önceki', 'aynısı', 'diğeri'];
    const hasPronouns = pronouns.some(p => textLower.includes(p));
    
    if (!hasPronouns || history.length === 0) {
      return text;
    }

    try {
      const historyStr = history.slice(-4).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
      
      const prompt = `Aşağıdaki metindeki işaret zamirlerini (onu, bunu, şunu, orada, burada, yarınki, önceki, aynısı, diğeri) önceki konuşma geçmişini kullanarak neyin kastettiklerini açıkça yazarak çözümle.
Örnek:
Geçmiş: "Arabam bozuldu."
Metin: "Onu servise götüreceğim."
Çıktı: "Arabayı servise götüreceğim."

Eğer metinde işaret zamiri varsa ve neyi kastettiği geçmişten KESİN olarak anlaşılamıyorsa, çıktı olarak "CLARIFY: [sorulacak netleştirme sorusu]" döndür.
Örnek: "Onu yarına al." (Geçmişte hem toplantı hem görev varsa): "CLARIFY: 'Onu' ile kastettiğiniz toplantı mı yoksa görev mi?"

Geçmiş:
${historyStr}

Metin: "${text}"

Çıktı:`;

      const response = await this.aiOrchestrator.chatComplete({
        message: prompt,
        systemInstruction: "Sen referans çözümleyen bir dil robotusun. Çıktı olarak sadece çözümlenmiş metni veya CLARIFY: ile başlayan netleştirme sorusunu döndürürsün."
      });

      return response.trim();
    } catch (e) {
      console.error('[ConversationAnalyzer] Reference resolution failed:', e);
      return text;
    }
  }

  /**
   * Extracts slots for multi-turn planning
   */
  public async extractSlots(input: string, currentSlots: PendingSlots): Promise<Partial<PendingSlots>> {
    try {
      const prompt = `Aşağıdaki kullanıcı mesajından toplantı, görev veya hatırlatıcı oluşturmak için gerekli olan şu bilgileri çıkar:
- title (konu veya başlık)
- time (saat veya tarih bilgisi)
- participants (katılımcılar - dizi formatında)
- location (yer/lokasyon)

Kullanıcı Mesajı: "${input}"

Mevcut Bilgiler:
${JSON.stringify(currentSlots)}

Çıktıyı SADECE JSON formatında ver, markdown kod bloğu kullanma. JSON şeması:
{
  "title": "bulunan başlık veya null",
  "time": "bulunan zaman/tarih veya null",
  "participants": ["katılımcı isimleri"] veya null,
  "location": "bulunan lokasyon veya null"
}`;

      const response = await this.aiOrchestrator.chatComplete({
        message: prompt,
        systemInstruction: "Sen bir slot çıkarma robotusun. Çıktı olarak sadece geçerli JSON döndürürsün."
      });

      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      const extracted: Partial<PendingSlots> = {};
      if (parsed.title) extracted.title = parsed.title;
      if (parsed.time) extracted.time = parsed.time;
      if (parsed.participants && Array.isArray(parsed.participants)) extracted.participants = parsed.participants;
      if (parsed.location) extracted.location = parsed.location;

      return extracted;
    } catch (e) {
      console.error('[ConversationAnalyzer] Slot extraction failed:', e);
      return {};
    }
  }
}
