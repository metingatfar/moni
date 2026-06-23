import { DateParserHelper } from './DateParserHelper';

export interface ParsedReminder {
  title: string;
  dateTime: Date | null;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
}

/**
 * @deprecated Use ReminderPlanner instead.
 */
export class ReminderParser {
  /**
   * Parses a reminder command from Turkish natural language.
   */
  public static async parse(text: string, apiKey?: string): Promise<ParsedReminder> {
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
          message: `Aşağıdaki Türkçe ifadeden hatırlatıcı (Reminder) bilgilerini analiz et ve JSON olarak çıkar.
Tarih/saat açıkça belirtilmemişse "dateTime" alanını null döndür. Belirtildiyse ISO string olarak döndür.
Tekrar durumunu belirle: 'none' (tek seferlik), 'daily' (her gün/günlük), 'weekly' (her hafta/haftalık) veya 'monthly' (her ay/aylık).

Çıktıyı SADECE JSON formatında ver, markdown kod bloğu kullanma. JSON şeması:
{
  "title": "hatırlatıcı başlığı (örn: 'Elektronik hedef sistemi şartnamesini kontrol et')",
  "dateTime": "ISOString_tarih_saat" veya null,
  "recurrence": "none" | "daily" | "weekly" | "monthly"
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
          title: parsed.title || 'Yeni Hatırlatıcı',
          dateTime: parsed.dateTime ? new Date(parsed.dateTime) : null,
          recurrence: parsed.recurrence || 'none'
        };
      }
    } catch (e) {
      console.error('ReminderParser: AI extraction failed, fallback to rules.', e);
    }

    // Fallback Rule-Based Parser
    return this.ruleBasedParse(text);
  }

  /**
   * Offline rules-based parser for reminders.
   */
  private static ruleBasedParse(text: string): ParsedReminder {
    const textLower = text.toLowerCase();

    // 1. Detect Recurrence
    let recurrence: 'none' | 'daily' | 'weekly' | 'monthly' = 'none';
    if (textLower.includes('her gün') || textLower.includes('hergün') || textLower.includes('günlük') || textLower.includes('gunluk')) {
      recurrence = 'daily';
    } else if (textLower.includes('her hafta') || textLower.includes('haftalık') || textLower.includes('haftalik')) {
      recurrence = 'weekly';
    } else if (textLower.includes('her ay') || textLower.includes('aylık') || textLower.includes('aylik')) {
      recurrence = 'monthly';
    }

    // 2. Extract Date/Time
    const dateTime = DateParserHelper.parse(text);

    // 3. Extract Title
    let cleaned = text;

    // Clean trigger phrases
    const triggers = [
      'diye hatırlat', 'hatırlat', 'beni uyar', 'uyar', 'hatırlatıcı ekle',
      'hatırlatıcı oluştur', 'hatırlatır mısın', 'hatırlatmak için', 'kontrol etmeyi'
    ];
    triggers.forEach(tr => {
      const reg = new RegExp(tr, 'gi');
      cleaned = cleaned.replace(reg, '');
    });

    // Clean recurrence words
    const recWords = ['her gün', 'hergün', 'günlük', 'gunluk', 'her hafta', 'haftalık', 'haftalik', 'her ay', 'aylık', 'aylik'];
    recWords.forEach(rw => {
      const reg = new RegExp(rw, 'gi');
      cleaned = cleaned.replace(reg, '');
    });

    // Clean date words
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

    // Final clean
    cleaned = cleaned.replace(/^[:\-,\s]+/, '').replace(/[:\-,\s]+$/, '').trim();

    if (!cleaned) {
      cleaned = 'Yeni Hatırlatıcı';
    }

    return {
      title: cleaned,
      dateTime,
      recurrence
    };
  }
}
