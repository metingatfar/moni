import { DateParserHelper } from './DateParserHelper';

export type CommandType = 'task' | 'reminder' | 'meeting' | 'note' | 'chat';

export interface RouteResult {
  type: CommandType;
  isClear: boolean;
  waitingFor?: 'confirmation' | 'date_clarification';
}

export class SecretaryCommandRouter {
  /**
   * Routes the user message to determines the command type and clarity.
   */
  public static async route(text: string, apiKey?: string): Promise<RouteResult> {
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `Aşağıdaki Türkçe ifadeye göre niyet (intent) tespiti yap ve JSON olarak çıkar.
Niyet Türleri:
- 'task' (kullanıcı görev eklemek, yapılacaklar listesine iş yazmak istiyor)
- 'reminder' (kullanıcı kendine bir şeyi hatırlatmak istiyor)
- 'meeting' (kullanıcı toplantı, görüşme, randevu, buluşma eklemek istiyor)
- 'note' (kullanıcı not almak, deftere yazmak istiyor)
- 'chat' (sekreterlik komutu olmayan, genel asistan sohbeti/soruları)

Netlik Analizi ("isClear"):
- Eğer cümle net bir emir/komut ise (örn: "ekle", "kaydet", "not al", "hatırlat") "isClear" true yap.
- Eğer cümle bir durum bildirimiyse (örn: "yarın toplantım var", "cuma günü şartnameye bakacağım") doğrudan emir vermediği için "isClear" false yap.
- İfade içerisinde tarih/saat belirtilmesi gereken bir durum var (task, reminder, meeting) ama tarih/saat hiç belirtilmemişse "isClear" false yap ve "waitingFor" alanını "date_clarification" olarak ata. Eğer tarih/saat varsa veya durum bir 'note'/'chat' ise "waitingFor" alanını "confirmation" olarak ata veya null yap.

Çıktıyı SADECE JSON formatında ver, markdown kod bloğu kullanma. JSON şeması:
{
  "type": "task" | "reminder" | "meeting" | "note" | "chat",
  "isClear": true veya false,
  "waitingFor": "confirmation" veya "date_clarification" veya null
}

İfade: "${text}"`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 150
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

          const parsed = JSON.parse(jsonText);
          return {
            type: parsed.type as CommandType,
            isClear: parsed.isClear === true,
            waitingFor: parsed.waitingFor || undefined
          };
        }
      } catch (e) {
        console.error('SecretaryCommandRouter: AI routing failed, falling back to rules.', e);
      }
    }

    // Fallback Rule-Based Routing
    return this.ruleBasedRoute(text);
  }

  /**
   * Offline rule-based router for Secretary Engine.
   */
  private static ruleBasedRoute(text: string): RouteResult {
    const textLower = text.toLowerCase();

    // 1. Detect Note
    const isNote = [
      'not al', 'not et', 'not ekle', 'not yaz', 'not:', 'deftere kaydet'
    ].some(tr => textLower.includes(tr));

    if (isNote) {
      return { type: 'note', isClear: true };
    }

    // 2. Detect Meeting
    const isMeeting = [
      'toplantı', 'toplanti', 'görüşme', 'gorusme', 'buluşma', 'bulusma', 'randevu'
    ].some(tr => textLower.includes(tr));

    // 3. Detect Reminder
    const isReminder = [
      'hatırlat', 'hatirlat', 'hatırlatıcı', 'hatirlatici', 'uyar'
    ].some(tr => textLower.includes(tr));

    // 4. Detect Task
    const isTask = [
      'görev ekle', 'görevekle', 'yapılacak ekle', 'yapilacak ekle', 'listeye ekle',
      'görevi ekle', 'görevini ekle', 'iş ekle', 'is ekle', 'görevi', 'gorevi'
    ].some(tr => textLower.includes(tr));

    let type: CommandType = 'chat';
    if (isMeeting) {
      type = 'meeting';
    } else if (isReminder) {
      type = 'reminder';
    } else if (isTask) {
      type = 'task';
    }

    if (type === 'chat') {
      return { type: 'chat', isClear: true };
    }

    // 5. Evaluate Clarity
    // Check if date/time is missing
    const parsedDate = DateParserHelper.parse(text);
    if (!parsedDate) {
      // Date is missing and type needs date (task, reminder, meeting)
      return {
        type,
        isClear: false,
        waitingFor: 'date_clarification'
      };
    }

    // Check if it has a direct command verb like "ekle", "kaydet", "hatırlat", "planla", "oluştur"
    const hasCommandVerb = [
      'ekle', 'kaydet', 'hatırlat', 'hatirlat', 'uyar', 'planla', 'oluştur', 'olustur',
      'al', 'et', 'yaz'
    ].some(v => textLower.includes(v));

    if (!hasCommandVerb) {
      // It is a statement (e.g. "yarın İl Müdürü ile toplantı") -> needs confirmation
      return {
        type,
        isClear: false,
        waitingFor: 'confirmation'
      };
    }

    // Direct and clear command
    return {
      type,
      isClear: true
    };
  }
}
