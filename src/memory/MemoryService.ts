import type { MemoryItem, MemoryCategory } from '../domain/entities/MemoryItem';

export class MemoryService {
  /**
   * Explicit keywords required to trigger saving to memory.
   * If the user doesn't use one of these phrases, we DO NOT save anything to memory.
   */
  private static SAVE_TRIGGERS = [
    'bunu hatırla',
    'bunu unutma',
    'bunu kaydet',
    'hafızana al',
    'benim için sakla'
  ];

  /**
   * Checks if the user's message explicitly requests remembering something.
   */
  public static shouldSaveMemory(text: string): boolean {
    const textLower = text.toLowerCase();
    return this.SAVE_TRIGGERS.some(trigger => textLower.includes(trigger));
  }

  /**
   * Checks if the user's message is asking what is remembered.
   */
  public static isQueryingMemory(text: string): boolean {
    const textLower = text.toLowerCase();
    return (
      textLower.includes('ne hatırlıyorsun') ||
      textLower.includes('hafızanda ne var') ||
      textLower.includes('beni ne kadar tanıyorsun') ||
      textLower.includes('hakkımda ne biliyorsun') ||
      textLower.includes('hafızandaki bilgiler')
    );
  }

  /**
   * Checks if the user is requesting to delete memory.
   */
  public static isDeleteRequest(text: string): boolean {
    const textLower = text.toLowerCase();
    return (
      textLower.includes('hafızadan sil') ||
      textLower.includes('hafızayı temizle') ||
      textLower.includes('bilgiyi unut') ||
      textLower.includes('bunu unut')
    );
  }

  /**
   * Formats the list of memories into a structured markdown block for the AI's System Instruction.
   */
  public static formatMemoriesForSystemInstruction(memories: MemoryItem[]): string {
    if (!memories || memories.length === 0) {
      return '';
    }

    const categories: Record<MemoryCategory, string[]> = {
      name: [],
      job: [],
      projects: [],
      habits: [],
      importantNotes: [],
      ongoingTasks: [],
      preferences: [],
      general: []
    };

    memories.forEach(item => {
      if (categories[item.category]) {
        categories[item.category].push(item.content);
      } else {
        categories.general.push(item.content);
      }
    });

    let context = '\n\n=== KULLANICI HAFIZA ALTYAPISI (MONI MEMORY ENGINE) ===\n';
    context += 'Kullanıcı hakkında hatırladığın kalıcı bilgiler şunlardır:\n';

    if (categories.name.length > 0) {
      context += `- Adı/Ismi: ${categories.name.join(', ')}\n`;
    }
    if (categories.job.length > 0) {
      context += `- Mesleği/Görevi: ${categories.job.join(', ')}\n`;
    }
    if (categories.projects.length > 0) {
      context += `- Üzerinde Çalıştığı Projeler: ${categories.projects.map(p => `"${p}"`).join(', ')}\n`;
    }
    if (categories.habits.length > 0) {
      context += `- Alışkanlıkları: ${categories.habits.join('; ')}\n`;
    }
    if (categories.importantNotes.length > 0) {
      context += `- Önemli Notları: ${categories.importantNotes.join('; ')}\n`;
    }
    if (categories.ongoingTasks.length > 0) {
      context += `- Devam Eden İşleri: ${categories.ongoingTasks.join('; ')}\n`;
    }
    if (categories.preferences.length > 0) {
      context += `- Tercihleri ve Beğenileri: ${categories.preferences.join('; ')}\n`;
    }
    if (categories.general.length > 0) {
      context += `- Diğer Genel Bilgiler: ${categories.general.join('; ')}\n`;
    }

    context += '\nYönerge: Yukarıdaki hafıza bilgilerini sohbet esnasında doğal bir şekilde kullanmalısın. Örneğin kullanıcıya ismiyle hitap edebilir, tercihlerini veya projelerini bildiğini hissettiren cümleler kurabilirsin. Bu bilgileri kullanıcıya yapay şekilde rapor halinde listeleme, konuşmanın akışında samimi bir şekilde kullan.\n';
    context += '======================================================\n';

    return context;
  }

  /**
   * Extracts category and content from the user's message using Gemini API (if key is available)
   * or a rule-based parser as fallback.
   */
  public static async extractMemoryFromText(
    text: string,
    apiKey?: string
  ): Promise<{ category: MemoryCategory; content: string } | null> {
    
    // Clean text from triggers to isolate the core fact
    let cleanedText = text;
    this.SAVE_TRIGGERS.forEach(trigger => {
      const reg = new RegExp(trigger, 'gi');
      cleanedText = cleanedText.replace(reg, '');
    });
    
    // Remove punctuation and cleanup whitespace
    cleanedText = cleanedText.replace(/^[:\-,\s]+/, '').replace(/[:\-,\s]+$/, '').trim();

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
                      text: `Aşağıdaki Türkçe ifadeden kullanıcının hafızaya kaydetmek istediği bilgiyi çıkar ve uygun kategoriyi seç.
Kategoriler: 
- 'name' (kullanıcının adı/ismi)
- 'job' (kullanıcının mesleği/görevi)
- 'projects' (üzerinde çalıştığı projeler)
- 'habits' (düzenli alışkanlıkları)
- 'importantNotes' (önemli notlar)
- 'ongoingTasks' (şu an uğraştığı devam eden işler)
- 'preferences' (tercihleri, beğenileri, çay/kahve/renk vb. zevkleri)
- 'general' (yukarıdakilere uymayan genel bilgiler)

Çıktıyı SADECE JSON formatında ver, markdown kod bloğu kullanma. JSON şeması:
{
  "category": "kategori_adi",
  "content": "özetlenmiş ve netleştirilmiş bilgi içeriği (örneğin: 'Kahveyi şekersiz içmeyi sever')"
}

İfade: "${cleanedText}"`
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
          
          // Clean json from markdown wrappers if model returned it as a block
          jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
          
          const parsed = JSON.parse(jsonText);
          if (parsed.category && parsed.content) {
            return {
              category: parsed.category as MemoryCategory,
              content: parsed.content.trim()
            };
          }
        }
      } catch (e) {
        console.error('MemoryService: AI extraction failed, falling back to rule-based parser.', e);
      }
    }

    // Fallback Rule-based / Regex Parser
    return this.ruleBasedExtraction(cleanedText);
  }

  /**
   * Fallback rule-based memory parser for offline mode or API failures.
   */
  private static ruleBasedExtraction(text: string): { category: MemoryCategory; content: string } | null {
    const textLower = text.toLowerCase();

    // 1. Name trigger
    if (
      textLower.startsWith('adım ') ||
      textLower.startsWith('ismim ') ||
      textLower.includes(' adım ') ||
      textLower.includes(' ismim ')
    ) {
      // e.g. "Benim adım Ahmet" -> "Ahmet"
      let name = '';
      const match = text.match(/(?:adım|ismim)\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)/i);
      if (match && match[1]) {
        name = match[1];
      } else {
        name = text;
      }
      return { category: 'name', content: name };
    }

    // 2. Job trigger
    if (
      textLower.includes('mesleğim') ||
      textLower.includes('olarak çalışıyorum') ||
      textLower.includes('görevim') ||
      textLower.includes('işim')
    ) {
      return { category: 'job', content: text };
    }

    // 3. Projects trigger
    if (textLower.includes('projem') || textLower.includes('projesinde') || textLower.includes('projesi')) {
      return { category: 'projects', content: text };
    }

    // 4. Habits trigger
    if (
      textLower.includes('alışkanlığım') ||
      textLower.includes('her sabah') ||
      textLower.includes('her gün') ||
      textLower.includes('düzenli olarak')
    ) {
      return { category: 'habits', content: text };
    }

    // 5. Preferences trigger
    if (
      textLower.includes('severim') ||
      textLower.includes('hoşlanırım') ||
      textLower.includes('tercih ederim') ||
      textLower.includes('tercihim')
    ) {
      return { category: 'preferences', content: text };
    }

    // 6. Ongoing tasks trigger
    if (
      textLower.includes('yapıyorum') ||
      textLower.includes('hazırlıyorum') ||
      textLower.includes('yazıyorum') ||
      textLower.includes('üzerinde çalışıyorum')
    ) {
      return { category: 'ongoingTasks', content: text };
    }

    // 7. Important Notes
    if (textLower.includes('önemli') || textLower.includes('not et')) {
      return { category: 'importantNotes', content: text };
    }

    // Default to general memory
    return { category: 'general', content: text };
  }
}
