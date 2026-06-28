import { voiceService } from '../../data/services/VoiceService';
import { databaseService } from '../../data/db/LocalDatabase';
import { container } from '../container/ServiceContainer';
import { ExecutiveBrain } from '../brain/ExecutiveBrain';
import { eventBus } from '../events/EventBus';
import { SecretaryService } from '../../secretary/SecretaryService';
import { DateParserHelper } from '../../secretary/DateParserHelper';
import { MemoryService } from '../../memory/MemoryService';

export interface UIContext {
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setMoniStatus: (status: 'idle' | 'listening' | 'thinking' | 'speaking') => void;
  setAvatarMood: (mood: 'thinking' | 'neutral' | 'happy' | 'focused' | 'alert') => void;
  setCurrentlySpeakingMsgId: (id: string | null) => void;
  currentLanguage: 'tr' | 'en';
  autoSpeakEnabled: boolean;
  speechRate: number;
  speechVolume: number;
  selectedSystemVoiceName?: string;
  geminiApiKey?: string;
  memories: any[];
  isWakeWordListening: boolean;
  startWakeWordRecognition: () => void;
  startCommandListening: () => void;
  showTemporaryError: (detail: string, summary: string) => void;
  pendingSecretary: any;
  setPendingSecretary: (cmd: any) => void;
  refreshDashboardData: () => Promise<void>;
}

export class MoniInteractionCoordinator {
  private static instance: MoniInteractionCoordinator;
  private uiContext: UIContext | null = null;

  private constructor() {}

  public static getInstance(): MoniInteractionCoordinator {
    if (!MoniInteractionCoordinator.instance) {
      MoniInteractionCoordinator.instance = new MoniInteractionCoordinator();
    }
    return MoniInteractionCoordinator.instance;
  }

  public setUIContext(context: UIContext) {
    this.uiContext = context;
  }

  /**
   * Central entry point to process both keyboard and voice inputs (STT -> Chat -> LLM -> Memory -> TTS)
   */
  public async processInput(text: string, source: 'keyboard' | 'voice' | 'system'): Promise<void> {
    if (!this.uiContext) {
      console.error('[MoniInteractionCoordinator] UIContext is not set.');
      return;
    }

    const {
      setMessages,
      setMoniStatus,
      setAvatarMood,
      setCurrentlySpeakingMsgId,
      currentLanguage,
      autoSpeakEnabled,
      speechRate,
      speechVolume,
      selectedSystemVoiceName,
      geminiApiKey,
      memories,
      isWakeWordListening,
      startWakeWordRecognition,
      showTemporaryError,
      refreshDashboardData
    } = this.uiContext;

    const trimmedText = text.trim();
    if (!trimmedText) return;

    console.log(`[MoniInteractionCoordinator] Processing input from source "${source}":`, trimmedText);

    // 1. Interrupt any active TTS playbacks before processing new inputs
    voiceService.cancelAllSpeech();

    // 2. Add user message to UI state and save to database
    const userMsg = {
      role: 'user' as const,
      content: trimmedText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    await databaseService.saveChatMessage(userMsg);

    // 3. Update status indicators
    setMoniStatus('thinking');
    setAvatarMood('thinking');

    // 4. Create placeholder assistant message
    const assistantMsgId = 'assistant-' + Date.now();
    const placeholderMsg = {
      id: assistantMsgId,
      role: 'assistant' as const,
      content: '',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, placeholderMsg]);

    let finalReply = '';
    let success = false;

    // A. Main pipeline attempt: ExecutiveBrain Orchestration
    try {
      const brain = container.resolve<ExecutiveBrain>('ExecutiveBrain');
      const userName = memories.find(m => m.category === 'name')?.content || 'Metin';
      brain.setUserName(userName);

      finalReply = await brain.processInput(trimmedText, (chunk: string) => {
        finalReply += chunk;
        setMessages(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: finalReply };
          }
          return updated;
        });
      });

      if (finalReply && finalReply.trim()) {
        success = true;
      }
    } catch (err: any) {
      console.warn('[MoniInteractionCoordinator] ExecutiveBrain orchestration failed. Running fallback...', err);
      eventBus.publish('LegacyFallbackUsed', { reason: err.message || String(err) });
    }

    // B. Legacy Fallback Mechanism (Secretary & Memory Engine)
    if (!success) {
      try {
        const textLower = trimmedText.toLowerCase();

        // 1. Check pending secretary commands
        if (this.uiContext.pendingSecretary) {
          const pending = this.uiContext.pendingSecretary;
          this.uiContext.setPendingSecretary(null);

          if (pending.waitingFor === 'confirmation') {
            const isYes = ['evet', 'tamam', 'olur', 'ekle', 'kaydet', 'onaylıyorum', 'onayliyorum', 'yes', 'onayla'].some(word => textLower.includes(word));
            if (isYes) {
              const res = await SecretaryService.saveCommand(pending.type, pending.data, memories.find(m => m.category === 'name')?.content || 'Metin');
              finalReply = res.message;
              await refreshDashboardData();
            } else {
              finalReply = currentLanguage === 'en' ? "Understood, cancelled the operation." : "Anlaşıldı, işlemi iptal ettim.";
            }
            success = true;
          } else if (pending.waitingFor === 'date_clarification') {
            const clarifiedDate = DateParserHelper.parse(trimmedText);
            if (clarifiedDate) {
              const updatedData = { ...pending.data, dateTime: clarifiedDate };
              const friendlyDate = SecretaryService.formatTurkishFriendlyDate(clarifiedDate);
              const label = pending.type === 'task' ? 'görev' : pending.type === 'reminder' ? 'hatırlatıcı' : 'toplantı';
              this.uiContext.setPendingSecretary({
                ...pending,
                data: updatedData,
                waitingFor: 'confirmation'
              });
              finalReply = currentLanguage === 'en' ? 
                `Understood. Would you like me to add this as a ${label} for ${friendlyDate}?` :
                `Tamamdır. Bunu ${friendlyDate} için ${label} olarak eklememi onaylıyor musunuz?`;
            } else {
              this.uiContext.setPendingSecretary(pending);
              finalReply = currentLanguage === 'en' ? 
                "I couldn't quite understand the date or time. When would you like to schedule it?" :
                "Tarih veya saati tam anlayamadım. Hangi gün ve saatte planlamak istersiniz?";
            }
            success = true;
          }
        }

        // 2. Normal legacy secretary routing
        if (!success) {
          const activeProjects = memories.filter(m => m.category === 'projects').map(m => m.content.trim());
          const userName = memories.find(m => m.category === 'name')?.content || 'Metin';
          const secretaryResult = await SecretaryService.processCommand(trimmedText, activeProjects, userName, geminiApiKey || undefined);

          if (secretaryResult.type !== 'chat') {
            if (secretaryResult.waitingFor) {
              this.uiContext.setPendingSecretary({
                type: secretaryResult.type,
                data: secretaryResult.data,
                originalText: trimmedText,
                waitingFor: secretaryResult.waitingFor
              });
              finalReply = secretaryResult.message;
            } else if (secretaryResult.success) {
              finalReply = secretaryResult.message;
              await refreshDashboardData();
            } else {
              finalReply = currentLanguage === 'en' ? "Sorry, a problem occurred while processing the command." : "Üzgünüm, komutu işlerken bir sorun oluştu.";
            }
            success = true;
          }
        }

        // 3. Memory Service Extraction
        if (!success) {
          if (MemoryService.shouldSaveMemory(trimmedText)) {
            const extracted = await MemoryService.extractMemoryFromText(trimmedText, geminiApiKey);
            if (extracted) {
              const newMemory = {
                id: Date.now().toString(),
                category: extracted.category,
                content: extracted.content,
                timestamp: new Date().toISOString()
              };
              await databaseService.saveMemory(newMemory);
              const categoryLabels: Record<string, string> = {
                name: 'adınızı', job: 'mesleğinizi', projects: 'projenizi', habits: 'alışkanlığınızı',
                importantNotes: 'önemli notunuzu', ongoingTasks: 'devam eden işinizi', preferences: 'tercihinizi', general: 'bilgiyi'
              };
              finalReply = `Bu bilgiyi hafızama kaydettim. ${categoryLabels[newMemory.category] || 'Bilgiyi'} "${newMemory.content}" olarak hatırlayacağım.`;
              await refreshDashboardData();
            } else {
              finalReply = "Üzgünüm, ifadeden net bir hafıza bilgisi çıkaramadım.";
            }
            success = true;
          } else if (MemoryService.isQueryingMemory(trimmedText)) {
            if (memories.length === 0) {
              finalReply = "Şu an sizin hakkınızda hafızamda kayıtlı hiçbir bilgi bulunmamaktadır.";
            } else {
              finalReply = "Sizin hakkınızda şunları hatırlıyorum:\n" + memories.map(m => `• ${m.category}: ${m.content}`).join('\n');
            }
            success = true;
          } else if (MemoryService.isDeleteRequest(trimmedText)) {
            await databaseService.clearMemories();
            finalReply = "Hafızamdaki hakkınızdaki tüm bilgileri sildim ve sıfırladım.";
            await refreshDashboardData();
            success = true;
          }
        }

        // 4. Default Legacy AI Stream (if not a secretary or memory command)
        if (!success) {
          const fallbackInstruction = "Sen Moni adında, son derece zeki, cana yakın ve profesyonel bir yapay zeka asistanı ve özel kalem yöneticisisin. Cevapların kısa, net, samimi ve sesli okumaya tam uyumlu olmalıdır.";
          let accumulatedText = '';

          await voiceService.streamChat(
            trimmedText,
            (chunk: string) => {
              accumulatedText += chunk;
              setMessages(prev => {
                if (prev.length === 0) return prev;
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = { ...updated[lastIdx], content: accumulatedText };
                }
                return updated;
              });
            },
            geminiApiKey,
            [],
            fallbackInstruction
          );

          finalReply = accumulatedText.trim();
          success = true;
        }

      } catch (fallbackErr: any) {
        console.error('[MoniInteractionCoordinator] Fallback query failed:', fallbackErr);
        
        let errorMsgText = '';
        if (currentLanguage === 'en') {
          errorMsgText = "The AI provider is currently busy or rate-limited. Please try again shortly.";
        } else {
          errorMsgText = "Şu anda yapay zeka sağlayıcısı yoğun veya limit dolu. Biraz sonra tekrar deneyebiliriz.";
        }

        finalReply = errorMsgText;
      }
    }

    // 5. Save finalized assistant reply to database and update UI
    setMessages(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      if (updated[lastIdx].role === 'assistant') {
        updated[lastIdx] = { ...updated[lastIdx], content: finalReply };
      }
      return updated;
    });

    const finalAiMsg = {
      id: assistantMsgId,
      role: 'assistant' as const,
      content: finalReply,
      timestamp: new Date()
    };
    await databaseService.saveChatMessage(finalAiMsg);

    // 6. Reset mood to normal
    setMoniStatus('idle');
    setAvatarMood('neutral');

    // 7. TTS Playback
    if (autoSpeakEnabled && finalReply.trim() && !finalReply.includes('Şu anda yapay zeka sağlayıcısı') && !finalReply.includes('AI provider is currently busy')) {
      console.log('[MoniInteractionCoordinator] TTS started');
      setCurrentlySpeakingMsgId(assistantMsgId);
      setMoniStatus('speaking');
      setAvatarMood('happy');

      const options = {
        rate: speechRate,
        volume: speechVolume,
        voiceName: selectedSystemVoiceName || undefined
      };

      await voiceService.speak(
        finalReply,
        'selin',
        () => {
          setCurrentlySpeakingMsgId(null);
          setMoniStatus('idle');
          setAvatarMood('neutral');
          if (isWakeWordListening) {
            startWakeWordRecognition();
          }
        },
        options,
        (errMessage: string) => {
          setCurrentlySpeakingMsgId(null);
          setMoniStatus('idle');
          setAvatarMood('neutral');
          showTemporaryError(
            `Seslendirme yapılamadı: ${errMessage}`,
            `Seslendirme Hatası: ${errMessage}`
          );
          if (isWakeWordListening) {
            startWakeWordRecognition();
          }
        }
      );
    } else {
      if (isWakeWordListening) {
        startWakeWordRecognition();
      }
    }
  }
}
export const moniInteractionCoordinator = MoniInteractionCoordinator.getInstance();
