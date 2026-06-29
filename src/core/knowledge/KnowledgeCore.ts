import { intentDetector } from './IntentDetector';
import type { IntentType } from './IntentDetector';
import { localFAQEngine } from './LocalFAQEngine';
import { providerHealthMonitor } from './ProviderHealthMonitor';
import { promptOptimizer } from './PromptOptimizer';

export class KnowledgeCore {
  private static instance: KnowledgeCore;

  private constructor() {}

  public static getInstance(): KnowledgeCore {
    if (!KnowledgeCore.instance) {
      KnowledgeCore.instance = new KnowledgeCore();
    }
    return KnowledgeCore.instance;
  }

  /**
   * Evaluates if a query should be answered locally.
   * If yes, returns the local answer.
   */
  public handleQuery(
    message: string,
    isEnglish: boolean,
    memories: any[] = []
  ): { resolved: boolean; text: string; intent: IntentType; providerStatus?: string } {
    const intent = intentDetector.detect(message);

    // 1. Check if intent is local
    const isLocal = intentDetector.isLocalIntent(intent);

    // 2. Try to query the Local FAQ Engine first
    const faqMatch = localFAQEngine.findMatch(message, isEnglish);
    if (faqMatch) {
      return {
        resolved: true,
        text: faqMatch,
        intent,
        providerStatus: 'Local Knowledge Core'
      };
    }

    // 3. Fallback to template generator if it matches specific high priority intents
    if (isLocal) {
      if (intent === 'greeting') {
        const trGreeting = "Merhaba! Size nasıl yardımcı olabilirim? Ben MONI, kişisel yapay zeka çalışma arkadaşınızım.";
        const enGreeting = "Hello! How can I assist you today? I am MONI, your personal AI workspace companion.";
        return {
          resolved: true,
          text: isEnglish ? enGreeting : trGreeting,
          intent,
          providerStatus: 'Local Knowledge Core'
        };
      }

      if (intent === 'identity') {
        const trId = "Merhaba, ben MONI AI Operating System. Metin GATFAR tarafından tasarlanmış kişisel yapay zeka çalışma arkadaşınım. Sohbet edebilir, sesli komutları anlayabilir, hafıza tutabilir, projelerini yönetebilir, rapor hazırlayabilir, workflow süreçlerini takip edebilir ve çalışma alanında sana yardımcı olabilirim.";
        const enId = "Hello, I am MONI AI Operating System, your personal AI workspace companion. I can chat, remember context, assist with projects, manage workflows, generate reports, and help you work more efficiently.";
        return {
          resolved: true,
          text: isEnglish ? enId : trId,
          intent,
          providerStatus: 'Local Knowledge Core'
        };
      }

      if (intent === 'feature_question') {
        const trFeat = "Benimle sohbet edebilir, ses modülasyonu yapabilir, aktivite geçmişinizi zaman akışında inceleyebilir, günlük özet raporları hazırlayabilir ve yerel veritabanınızda kişisel tercihlerinizi güvenle saklayabilirsiniz.";
        const enFeat = "I can manage your tasks, modulate voice outputs, log activity timelines, handle context-aware settings, and compile morning briefs locally.";
        return {
          resolved: true,
          text: isEnglish ? enFeat : trFeat,
          intent,
          providerStatus: 'Local Knowledge Core'
        };
      }

      if (intent === 'provider_status') {
        const list = providerHealthMonitor.getStatusList();
        const trStatus = `Yapay zeka sağlayıcı durumları: ${list.map(p => `${p.name}: ${p.state}`).join(', ')}. API limiti dolduğunda sistem otomatik olarak bir yedek sağlayıcıya geçiş yapar veya yerel motoru kullanır.`;
        const enStatus = `AI Provider health states: ${list.map(p => `${p.name}: ${p.state}`).join(', ')}. If any API limit is reached, MONI automatically switches to fallbacks or local responses.`;
        return {
          resolved: true,
          text: isEnglish ? enStatus : trStatus,
          intent,
          providerStatus: 'Local Knowledge Core'
        };
      }

      if (intent === 'help') {
        const trHelp = "Komut paletini açmak için Ctrl+K tuşlarına basabilir, arama kutusuna komut veya FAQ terimleri yazabilir ya da ayarlardan proaktif önerileri kişiselleştirebilirsiniz.";
        const enHelp = "You can view the system dashboard, inspect custom memories, open help FAQ pages, press Ctrl+K for search, or configure proactive settings.";
        return {
          resolved: true,
          text: isEnglish ? enHelp : trHelp,
          intent,
          providerStatus: 'Local Knowledge Core'
        };
      }

      if (intent === 'memory_question') {
        const summary = promptOptimizer.summarizeMemory(memories);
        const trMem = summary 
          ? `Hafızamda sizin hakkınızda şunları hatırlıyorum: ${summary}. Dilerseniz "hafızamı temizle" diyerek sıfırlayabilirsiniz.`
          : "Hafızamda şu an sizin hakkınızda kayıtlı herhangi bir bilgi bulunmuyor. Benimle sohbet ettikçe sizi tanıyabilirim.";
        const enMem = summary
          ? `I remember the following about you: ${summary}. You can say "clear my memory" to start fresh.`
          : "I don't have any facts saved in my memory yet. I will learn about you as we talk.";
        return {
          resolved: true,
          text: isEnglish ? enMem : trMem,
          intent,
          providerStatus: 'Local Knowledge Core'
        };
      }
    }

    return {
      resolved: false,
      text: '',
      intent
    };
  }
}

export const knowledgeCore = KnowledgeCore.getInstance();
export default knowledgeCore;
