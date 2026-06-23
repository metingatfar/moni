import { DateParserHelper } from './DateParserHelper';

export interface ParsedMeeting {
  title: string;
  dateTime: Date | null;
  participant?: string;
  location?: string;
  description?: string;
}

/**
 * @deprecated Use MeetingPlanner instead.
 */
export class MeetingParser {
  /**
   * Parses a meeting command from Turkish natural language.
   */
  public static async parse(text: string, apiKey?: string): Promise<ParsedMeeting> {
    try {
      const backendUrl = (import.meta.env && import.meta.env.VITE_BACKEND_API_URL) 
        ? import.meta.env.VITE_BACKEND_API_URL.replace(/\/api$/, '') 
        : 'http://localhost:5000';
      const targetUrl = `${backendUrl}/api/chat/complete`;

      const provider = typeof window !== 'undefined' ? (localStorage.getItem('moni_active_provider') || 'gemini') : 'gemini';

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Aşağıdaki Türkçe ifadeden toplantı/görüşme/randevu (Meeting) bilgilerini analiz et ve JSON olarak çıkar.
Tarih/saat açıkça belirtilmemişse "dateTime" alanını null döndür. Belirtildiyse ISO string olarak döndür.
"participant": Görüşülecek kişi veya kurum (örn: 'İl Müdürü', 'Ahmet Yılmaz').
"location": Görüşmenin yapılacağı yer (örn: 'Zoom', 'Makam Odası', 'Ofis').
"title": Toplantının ana konusu (örn: 'elektronik hedef sistemi', 'bütçe planlaması').

Çıktıyı SADECE JSON formatında ver, markdown kod bloğu kullanma. JSON şeması:
{
  "title": "toplantı konusu / başlığı",
  "dateTime": "ISOString_tarih_saat" veya null,
  "participant": "katılımcı_kişi_kurum" veya null,
  "location": "toplantı_yeri" veya null,
  "description": "ek açıklama" veya null
}

İfade: "${text}"`,
          apiKey,
          provider
        })
      });

      if (response.status === 404) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('moni_info_notification', {
            detail: { message: 'Backend güncel değil veya yanlış API adresine bağlanıldı.' }
          }));
        }
        throw new Error("Backend güncel değil veya yanlış API adresine bağlanıldı.");
      }

      if (response.ok) {
        const data = await response.json();
        let jsonText = data.text || '';
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(jsonText);
        return {
          title: parsed.title || 'Toplantı',
          dateTime: parsed.dateTime ? new Date(parsed.dateTime) : null,
          participant: parsed.participant || undefined,
          location: parsed.location || undefined,
          description: parsed.description || undefined
        };
      }
    } catch (e) {
      console.error('MeetingParser: AI extraction failed, fallback to rules.', e);
    }

    // Fallback Rule-Based Parser
    return this.ruleBasedParse(text);
  }

  /**
   * Offline rules-based parser for meetings.
   */
  private static ruleBasedParse(text: string): ParsedMeeting {
    const textLower = text.toLowerCase();

    // 1. Extract Date/Time
    const dateTime = DateParserHelper.parse(text);

    // 2. Extract Participant (look for "X ile" or "X'le")
    let participant: string | undefined;
    const ileMatch = text.match(/([A-ZÇĞİÖŞÜa-zçğıöşü\s]+)\s+ile/i);
    if (ileMatch && ileMatch[1]) {
      const p = ileMatch[1].trim();
      // Make sure it's not a relative word like "cuma" or generic pronoun
      const badWords = ['saat', 'bugün', 'yarın', 'cuma', 'cumartesi', 'pazar', 'pazartesi', 'salı', 'çarşamba', 'perşembe'];
      if (!badWords.includes(p.toLowerCase())) {
        participant = p;
      }
    }

    // 3. Extract Location
    let location: string | undefined;
    if (textLower.includes('ofisinde') || textLower.includes('ofiste')) {
      location = 'Ofis';
    } else if (textLower.includes('zoom üzerinden') || textLower.includes('zoom\'da') || textLower.includes('zoomda')) {
      location = 'Zoom';
    } else if (textLower.includes('makamında') || textLower.includes('makam odasında')) {
      location = 'Makam Odası';
    } else {
      const yerMatch = text.match(/(?:yer|konum)\s*:\s*([A-Za-zÇĞİÖŞÜçğıöşü\s\d]+)/i);
      if (yerMatch && yerMatch[1]) {
        location = yerMatch[1].trim();
      }
    }

    // 4. Construct Title
    let cleaned = text;

    // Clean trigger words
    const triggers = [
      'toplantısı ekle', 'toplantı ekle', 'görüşmesi ekle', 'görüşme ekle', 'toplantı',
      'görüşme', 'randevu ekle', 'randevu', 'buluşma', 'planla', 'ekle', 'kaydet'
    ];
    triggers.forEach(tr => {
      const reg = new RegExp(tr, 'gi');
      cleaned = cleaned.replace(reg, '');
    });

    // Clean "X ile" if matched
    if (participant) {
      const reg = new RegExp(`${participant}\\s+ile`, 'gi');
      cleaned = cleaned.replace(reg, '');
    }

    // Clean dates
    const dateWords = [
      'yarın', 'bugün', 'bugun', 'yarin', 'öbür gün', 'obur gun', 'ertesi gün',
      'pazartesi', 'salı', 'sali', 'çarşamba', 'carsamba', 'perşembe', 'persembe',
      'cuma', 'cumartesi', 'pazar', 'günü', 'gunu'
    ];
    dateWords.forEach(dw => {
      const reg = new RegExp(`\\b${dw}\\b`, 'gi');
      cleaned = cleaned.replace(reg, '');
    });

    // Clean hours
    cleaned = cleaned.replace(/(?:saat\s*)?\d{1,2}(?:[\s:.]+\d{2})?/gi, '');
    cleaned = cleaned.replace(/saat\s*(bir|iki|üç|uc|dört|dort|beş|bes|altı|alti|yedi|sekiz|dokuz|on|yirmi)/gi, '');
    cleaned = cleaned.replace(/(?:da|de|ta|te|ya|ye|nda|nde|n)\b/gi, '');

    cleaned = cleaned.replace(/^[:\-,\s]+/, '').replace(/[:\-,\s]+$/, '').trim();

    let title = cleaned || 'Toplantı';

    return {
      title,
      dateTime,
      participant,
      location
    };
  }
}
