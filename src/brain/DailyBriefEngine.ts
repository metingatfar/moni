import type { MemoryItem } from '../domain/entities/MemoryItem';
import type { ScoredTodo } from './PriorityEngine';
import type { Reminder } from '../domain/entities/Reminder';

export class DailyBriefEngine {
  /**
   * Generates the personalized Daily Brief text.
   * Uses Gemini API if apiKey is provided, otherwise falls back to a clean rule-based template.
   */
  public static async generateDailyBrief(
    memories: MemoryItem[],
    scoredTodos: ScoredTodo[],
    reminders: Reminder[],
    apiKey?: string
  ): Promise<string> {
    // 1. Gather context data
    const now = new Date();
    const currentHour = now.getHours();
    
    // Determine greeting phrase based on current time
    let greeting = 'Günaydın';
    if (currentHour >= 18) {
      greeting = 'İyi akşamlar';
    } else if (currentHour >= 12) {
      greeting = 'Tünaydın';
    }

    // Extract user profile from memories
    const nameMemory = memories.find(m => m.category === 'name');
    const userName = nameMemory ? nameMemory.content.trim() : '';

    const projectMemories = memories.filter(m => m.category === 'projects');
    const activeProjects = projectMemories.map(m => m.content.trim());

    // Count today's tasks and meetings
    const incompleteTodos = scoredTodos.filter(t => !t.isCompleted);
    const todayReminders = reminders.filter(r => {
      const d = new Date(r.dateTime);
      return this.isSameDay(d, now) && !r.isCompleted;
    });

    const topTodo = incompleteTodos.length > 0 ? incompleteTodos[0] : null;

    // 2. If API Key is present, attempt LLM briefing generation
    if (apiKey && apiKey.trim()) {
      try {
        const prompt = this.buildLLMPrompt({
          greeting,
          userName,
          todoCount: incompleteTodos.length,
          reminderCount: todayReminders.length,
          activeProjects,
          topTodo: topTodo ? topTodo.task : '',
          timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 250
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          let briefText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          briefText = briefText.replace(/[\*\_#`\-]/g, '').trim(); // Strip formatting for speech compatibility
          if (briefText) {
            return briefText;
          }
        }
      } catch (e) {
        console.error('DailyBriefEngine: Gemini briefing generation failed, falling back to rule-based template.', e);
      }
    }

    // 3. Offline Rule-based Local Fallback Briefing
    return this.generateRuleBasedBrief({
      greeting,
      userName,
      todoCount: incompleteTodos.length,
      reminderCount: todayReminders.length,
      activeProjects,
      topTodoText: topTodo ? topTodo.task : ''
    });
  }

  /**
   * Constructs the structured prompt for LLM briefing.
   */
  private static buildLLMPrompt(data: {
    greeting: string;
    userName: string;
    todoCount: number;
    reminderCount: number;
    activeProjects: string[];
    topTodo: string;
    timeStr: string;
  }): string {
    return `Sen MONI adında bir dijital çalışma arkadaşısın. Kullanıcıya sabah/gün başlarken bir günlük durum briefing'i sunacaksın.
Aşağıdaki yapılandırılmış verileri alıp akıcı, doğal, samimi ve Türkçe sesli okumaya tam uygun bir hitap paragrafı oluştur.
KURALLAR:
1. Markdown işaretleri (*, **, _, listeler, başlıklar vb.) KESİNLİKLE kullanma, çünkü metin doğrudan seslendirilecektir.
2. Cümlelerin kısa ve dinlemesi kolay olsun.
3. Proje bilgisini doğal şekilde bağlama yedir (Örneğin: "FitHayat projenizde her şey yolunda görünüyor" gibi).
4. En önemli görevi bugünkü ana odak olarak vurgula.

VERİLER:
- Zaman/Karşılama: ${data.greeting} ${data.userName ? `(İsim: ${data.userName})` : ''}
- Aktif Görev Sayısı: ${data.todoCount}
- Bugünkü Toplantı/Ajanda Sayısı: ${data.reminderCount}
- Aktif Projeler: ${data.activeProjects.length > 0 ? data.activeProjects.join(', ') : 'Belirtilmemiş'}
- Bugünkü En Yüksek Öncelikli İş: ${data.topTodo ? `"${data.topTodo}"` : 'Yok'}

Örnek çıktı tonu: "Günaydın Metin. Bugün yapılacaklar listende 3 görevin ve ajandanda 2 toplantın bulunuyor. Üzerinde çalıştığın FitHayat projesinde dün kaldığımız yer hazır. Bugünkü önceliğim elektronik hedef sistemi yazısını tamamlaman."`;
  }

  /**
   * Hardcoded high-quality Turkish template brief when offline or API is missing.
   */
  private static generateRuleBasedBrief(data: {
    greeting: string;
    userName: string;
    todoCount: number;
    reminderCount: number;
    activeProjects: string[];
    topTodoText: string;
  }): string {
    const greetingPart = data.userName ? `${data.greeting} ${data.userName}.` : `${data.greeting}.`;
    
    let taskPart = '';
    if (data.todoCount > 0) {
      taskPart = `Bugün yapılacaklar listende ${data.todoCount} aktif görevin var.`;
    } else {
      taskPart = 'Bugün için planlanmış acil bir görevin bulunmuyor.';
    }

    let reminderPart = '';
    if (data.reminderCount > 0) {
      reminderPart = `Ajandanda bugün gerçekleşecek ${data.reminderCount} toplantın bulunuyor.`;
    } else {
      reminderPart = 'Bugün takviminde herhangi bir randevu veya toplantı kaydı görünmüyor.';
    }

    let projectPart = '';
    if (data.activeProjects.length > 0) {
      // Mention the first active project
      projectPart = `Üzerinde çalıştığın ${data.activeProjects[0]} projesinde dün kaldığımız yer hazır.`;
    }

    let focusPart = '';
    if (data.topTodoText) {
      focusPart = `Bugünkü öncelikli tavsiyem, "${data.topTodoText}" görevini tamamlaman.`;
    }

    return `${greetingPart} ${taskPart} ${reminderPart} ${projectPart} ${focusPart}`.trim();
  }

  private static isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
}
