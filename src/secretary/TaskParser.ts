import { DateParserHelper } from './DateParserHelper';

export interface ParsedTask {
  task: string;
  dateTime: Date | null;
  priority: 'low' | 'medium' | 'high';
  project?: string;
  description?: string;
}

/**
 * @deprecated Use TaskPlanner instead.
 */
export class TaskParser {
  /**
   * Parses a task command from Turkish natural language.
   */
  public static async parse(
    text: string,
    activeProjects: string[],
    apiKey?: string
  ): Promise<ParsedTask> {
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
          message: `Aşağıdaki Türkçe ifadeden yapılacak bir iş/görev (Todo) bilgisini analiz et ve JSON formatında çıkar.
Projeler Listesi: ${JSON.stringify(activeProjects)}
Eğer ifadedeki iş bu projelerden biriyle ilgiliyse "project" alanına projeyi yaz.
Tarih/saat açıkça belirtilmemişse "dateTime" alanını null döndür. Belirtildiyse ISO string olarak döndür.
Skor önceliğini seç: 'high' (yüksek, acil, hemen, kritik), 'low' (düşük, önemsiz), veya 'medium' (varsayılan).

Çıktıyı SADECE JSON formatında ver, markdown kod bloğu kullanma. JSON şeması:
{
  "task": "görev başlığı (örn: 'Video eğitim ekranı tasarımı')",
  "dateTime": "ISOString_tarih_saat" veya null,
  "priority": "low" | "medium" | "high",
  "project": "proje_adi" veya null,
  "description": "görev açıklaması" veya null
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
          task: parsed.task || 'Yeni Görev',
          dateTime: parsed.dateTime ? new Date(parsed.dateTime) : null,
          priority: parsed.priority || 'medium',
          project: parsed.project || undefined,
          description: parsed.description || undefined
        };
      }
    } catch (e) {
      console.error('TaskParser: AI extraction failed, fallback to rules.', e);
    }

    // Fallback Rule-Based Parser
    return this.ruleBasedParse(text, activeProjects);
  }

  /**
   * Offline rules-based parser for tasks.
   */
  private static ruleBasedParse(text: string, activeProjects: string[]): ParsedTask {
    const textLower = text.toLowerCase();
    
    // 1. Detect Priority
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (
      textLower.includes('yüksek') ||
      textLower.includes('acil') ||
      textLower.includes('kritik') ||
      textLower.includes('önemli')
    ) {
      priority = 'high';
    } else if (textLower.includes('düşük') || textLower.includes('önemsiz') || textLower.includes('ertelenen')) {
      priority = 'low';
    }

    // 2. Detect Project Match
    let matchedProject: string | undefined;
    for (const project of activeProjects) {
      if (textLower.includes(project.toLowerCase())) {
        matchedProject = project;
        break;
      }
    }

    // 3. Extract Date/Time
    const dateTime = DateParserHelper.parse(text);

    // 4. Extract Task Title
    // Clean triggers and details
    let cleaned = text;

    // Clean project phrases
    if (matchedProject) {
      const projCleanRegex = new RegExp(`${matchedProject}\\s*(projesi)?\\s*(için)?`, 'gi');
      cleaned = cleaned.replace(projCleanRegex, '');
    }

    // Clean trigger verbs
    const triggers = [
      'görev ekle', 'yapılacak ekle', 'listeye ekle', 'görevi ekle', 'görevini ekle',
      'ekle', 'kaydet', 'oluştur', 'yapılacaklar listeme'
    ];
    triggers.forEach(tr => {
      const reg = new RegExp(tr, 'gi');
      cleaned = cleaned.replace(reg, '');
    });

    // Clean priority words
    const prioWords = ['yüksek öncelikli', 'düşük öncelikli', 'orta öncelikli', 'yüksek', 'düşük', 'acil', 'kritik', 'önemli'];
    prioWords.forEach(pw => {
      const reg = new RegExp(`\\b${pw}\\b`, 'gi');
      cleaned = cleaned.replace(reg, '');
    });

    // Clean dates and relative words
    const dateWords = [
      'yarın', 'bugün', 'bugun', 'yarin', 'öbür gün', 'obur gun', 'ertesi gün',
      'pazartesi', 'salı', 'sali', 'çarşamba', 'carsamba', 'perşembe', 'persembe',
      'cuma', 'cumartesi', 'pazar', 'günü', 'gunu'
    ];
    dateWords.forEach(dw => {
      const reg = new RegExp(`\\b${dw}\\b`, 'gi');
      cleaned = cleaned.replace(reg, '');
    });

    // Clean hour text formats
    cleaned = cleaned.replace(/(?:saat\s*)?\d{1,2}(?:[\s:.]+\d{2})?/gi, '');
    cleaned = cleaned.replace(/saat\s*(bir|iki|üç|uc|dört|dort|beş|bes|altı|alti|yedi|sekiz|dokuz|on|yirmi)/gi, '');
    cleaned = cleaned.replace(/(?:da|de|ta|te|ya|ye|nda|nde|n)\b/gi, '');

    // Final trim & formatting
    cleaned = cleaned.replace(/^[:\-,\s]+/, '').replace(/[:\-,\s]+$/, '').trim();

    if (!cleaned) {
      cleaned = 'Yeni Görev';
    }

    return {
      task: cleaned,
      dateTime,
      priority,
      project: matchedProject
    };
  }
}
