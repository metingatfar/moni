import { voiceService } from '../../data/services/VoiceService';
import { databaseService } from '../../data/db/LocalDatabase';
import { container } from '../container/ServiceContainer';
import { ExecutiveBrain } from '../brain/ExecutiveBrain';
import { eventBus } from '../events/EventBus';
import { SecretaryService } from '../../secretary/SecretaryService';
import { DateParserHelper } from '../../secretary/DateParserHelper';
import { MemoryService } from '../../memory/MemoryService';
import { knowledgeCore } from '../knowledge/KnowledgeCore';
import { providerHealthMonitor } from '../knowledge/ProviderHealthMonitor';

export type RuntimeState = 'IDLE' | 'WAITING_WAKE' | 'WAKE_DETECTED' | 'GREETING' | 'WAITING_COMMAND' | 'PROCESSING' | 'PROVIDER' | 'MEMORY' | 'TTS';
export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'success' | 'error' | 'offline';
export type WakeStatus = 'Idle' | 'Starting' | 'Listening' | 'Seni dinliyorum...' | 'Paused (TTS)' | 'Processing' | 'Restarting' | 'Error' | 'Detected';
export type MicPermission = 'Granted' | 'Denied' | 'Prompt' | 'Unknown';

export interface RuntimeStateData {
  runtimeState: RuntimeState;
  orbState: OrbState;
  wakeStatus: WakeStatus;
  micPermission: MicPermission;
  lastTranscript: string;
  lastNormalizedTranscript: string;
  activeProvider: string;
  isSpeaking: boolean;
  lastError: string;
  speechApiSupported: boolean;
  selfAudioIgnoredCount: number;
  echoCancellationEnabled: boolean;
  noiseSuppressionEnabled: boolean;
  autoGainEnabled: boolean;
  isStartingOrRunning: boolean;
  ttsProvider: 'ElevenLabs' | 'Browser';
}

export class MoniRuntime {
  private static instance: MoniRuntime;
  private instanceId: string = '';

  // Runtime states
  private runtimeState: RuntimeState = 'IDLE';
  private orbState: OrbState = 'idle';
  private wakeStatus: WakeStatus = 'Idle';
  private micPermission: MicPermission = 'Unknown';
  private lastTranscript: string = '';
  private lastNormalizedTranscript: string = '';
  private activeProvider: string = 'gemini';
  private isSpeaking: boolean = false;
  private lastError: string = '';
  private speechApiSupported: boolean = true;
  private selfAudioIgnoredCount: number = 0;
  private echoCancellationEnabled: boolean = true;
  private noiseSuppressionEnabled: boolean = true;
  private autoGainEnabled: boolean = true;
  private ttsProvider: 'ElevenLabs' | 'Browser' = 'ElevenLabs';

  // Speech recognition instance & states
  private recognition: any = null;
  private isWakeWordListening: boolean = false;
  private isStartingOrRunning: boolean = false;
  private micStream: MediaStream | null = null;
  private isWaitingForCommand: boolean = false;
  private commandTimeoutTimer: any = null;
  private recognitionRestartTimer: any = null;
  
  // TTS State tracking
  private lastTtsText: string = '';
  private ttsStartedAt: number = 0;
  private ttsEndedAt: number = 0;

  // Settings
  private currentLanguage: 'tr' | 'en' = 'tr';
  private autoSpeakEnabled: boolean = true;
  private speechRate: number = 1.0;
  private speechVolume: number = 1.0;
  private selectedSystemVoiceName: string | undefined = undefined;

  // Callbacks for UI sync
  private listeners: ((state: RuntimeStateData) => void)[] = [];
  private messagesCallback: ((updater: (prev: any[]) => any[]) => void) | null = null;
  private refreshDashboardDataCallback: (() => Promise<void>) | null = null;
  private pendingSecretary: any | null = null;
  private setPendingSecretaryCallback: ((val: any | null) => void) | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.speechApiSupported = !!SpeechRecognition;
      
      // Load initial config from local storage if available
      this.isWakeWordListening = localStorage.getItem('moni_wake_word_active') === 'true';
      this.currentLanguage = (localStorage.getItem('moni_language') as 'tr' | 'en') || 'tr';
      this.autoSpeakEnabled = localStorage.getItem('moni_auto_speak') !== 'false';
      this.speechRate = parseFloat(localStorage.getItem('moni_speech_rate') || '1.0');
      this.speechVolume = parseFloat(localStorage.getItem('moni_speech_volume') || '1.0');
      this.selectedSystemVoiceName = localStorage.getItem('moni_selected_voice') || undefined;
      this.activeProvider = localStorage.getItem('moni_selected_provider') || 'gemini';

      // Keep track of runtime instances to verify singleton counts
      (window as any).__moniRuntimeInstanceCount = ((window as any).__moniRuntimeInstanceCount || 0) + 1;
      this.instanceId = 'inst-' + Math.random().toString(36).substr(2, 9);
      console.log(`[MoniRuntime] MoniRuntime instance created. ID: ${this.instanceId}, Instance count: ${(window as any).__moniRuntimeInstanceCount}`);

      // Listen for TTS provider change from VoiceService
      window.addEventListener('moni_tts_provider_changed', (e: any) => {
        if (e.detail && e.detail.provider) {
          this.ttsProvider = e.detail.provider;
          this.notify();
        }
      });

      // Load session storage ttsProvider state - Force Browser for now
      this.ttsProvider = 'Browser';
    }
  }

  public static getInstance(): MoniRuntime {
    if (typeof window !== 'undefined') {
      if (!(window as any).__moniRuntimeInstance) {
        (window as any).__moniRuntimeInstance = new MoniRuntime();
      }
      return (window as any).__moniRuntimeInstance;
    }
    if (!MoniRuntime.instance) {
      MoniRuntime.instance = new MoniRuntime();
    }
    return MoniRuntime.instance;
  }

  // --- UI Register Channels ---
  public subscribe(listener: (state: RuntimeStateData) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public setMessagesUpdater(callback: (updater: (prev: any[]) => any[]) => void) {
    this.messagesCallback = callback;
  }

  public setRefreshDashboardData(callback: () => Promise<void>) {
    this.refreshDashboardDataCallback = callback;
  }

  public setPendingSecretaryHandlers(
    getPending: () => any | null,
    setPending: (val: any | null) => void
  ) {
    this.pendingSecretary = getPending();
    this.setPendingSecretaryCallback = (val) => {
      this.pendingSecretary = val;
      setPending(val);
    };
  }

  private getEffectiveOrbState(): OrbState {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return 'offline';
    }
    return this.orbState;
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(l => l(state));
  }

  public getState(): RuntimeStateData {
    return {
      runtimeState: this.runtimeState,
      orbState: this.getEffectiveOrbState(),
      wakeStatus: this.wakeStatus,
      micPermission: this.micPermission,
      lastTranscript: this.lastTranscript,
      lastNormalizedTranscript: this.lastNormalizedTranscript,
      activeProvider: this.activeProvider,
      isSpeaking: this.isSpeaking,
      lastError: this.lastError,
      speechApiSupported: this.speechApiSupported,
      selfAudioIgnoredCount: this.selfAudioIgnoredCount,
      echoCancellationEnabled: this.echoCancellationEnabled,
      noiseSuppressionEnabled: this.noiseSuppressionEnabled,
      autoGainEnabled: this.autoGainEnabled,
      isStartingOrRunning: this.isStartingOrRunning,
      ttsProvider: this.ttsProvider
    };
  }

  // --- Configuration Mutators ---
  public setLanguage(lang: 'tr' | 'en') {
    this.currentLanguage = lang;
    if (typeof window !== 'undefined') localStorage.setItem('moni_language', lang);
  }

  public setAutoSpeakEnabled(enabled: boolean) {
    this.autoSpeakEnabled = enabled;
    if (typeof window !== 'undefined') localStorage.setItem('moni_auto_speak', String(enabled));
  }

  public setSpeechRate(rate: number) {
    this.speechRate = rate;
    if (typeof window !== 'undefined') localStorage.setItem('moni_speech_rate', String(rate));
  }

  public setSpeechVolume(volume: number) {
    this.speechVolume = volume;
    if (typeof window !== 'undefined') localStorage.setItem('moni_speech_volume', String(volume));
  }

  public setSystemVoice(voiceName: string | undefined) {
    this.selectedSystemVoiceName = voiceName;
    if (typeof window !== 'undefined' && voiceName) localStorage.setItem('moni_selected_voice', voiceName);
  }

  public setProvider(providerName: string) {
    this.activeProvider = providerName;
    if (typeof window !== 'undefined') localStorage.setItem('moni_selected_provider', providerName);
    this.notify();
  }

  // --- Runtime Controller Methods ---
  public async start() {
    if (this.runtimeState !== 'IDLE') return;
    
    // Determine target initial state based on wake word listening setting
    if (this.isWakeWordListening) {
      await this.startWakeWordListening();
    } else {
      this.runtimeState = 'IDLE';
      this.orbState = 'idle';
      this.wakeStatus = 'Idle';
      this.notify();
    }
  }

  public stop() {
    this.destroyRecognition();
    voiceService.cancelAllSpeech();
    this.isSpeaking = false;
    this.isStartingOrRunning = false;
    this.isWaitingForCommand = false;
    if (this.commandTimeoutTimer) {
      clearTimeout(this.commandTimeoutTimer);
      this.commandTimeoutTimer = null;
    }
    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      this.micStream = null;
    }
    this.runtimeState = 'IDLE';
    this.orbState = 'idle';
    this.wakeStatus = 'Idle';
    this.notify();
  }

  public async activateVoice() {
    this.isWakeWordListening = true;
    if (typeof window !== 'undefined') localStorage.setItem('moni_wake_word_active', 'true');
    await this.startWakeWordListening();
  }

  public deactivateVoice() {
    this.isWakeWordListening = false;
    if (typeof window !== 'undefined') localStorage.setItem('moni_wake_word_active', 'false');
    this.stop();
  }

  // --- SpeechRecognition Engines ---
  private destroyRecognition() {
    if (this.recognitionRestartTimer) {
      clearTimeout(this.recognitionRestartTimer);
      this.recognitionRestartTimer = null;
    }
    if (this.recognition) {
      console.log('VOICE_ENGINE_DESTROY_RECOGNITION');
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch (e) {
        console.warn('[MoniRuntime] Error during abort:', e);
      }
      this.recognition = null;
    }
    this.isStartingOrRunning = false;
  }

  private async startWakeWordListening() {
    if (typeof window === 'undefined' || !this.speechApiSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    this.destroyRecognition();
    this.isStartingOrRunning = true;
    this.runtimeState = 'WAITING_WAKE';
    this.wakeStatus = 'Starting';
    this.orbState = 'idle';
    this.notify();

    // Enforce mic permission and capture constraints
    const granted = await this.checkMicPermission();
    if (!granted) {
      this.wakeStatus = 'Error';
      this.isStartingOrRunning = false;
      this.notify();
      return;
    }

    this.wakeStatus = 'Listening';
    this.notify();

    console.log('VOICE_ENGINE_CREATE_RECOGNITION_WAKE');
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'tr-TR';

    rec.onstart = () => {
      this.isStartingOrRunning = false;
      this.notify();
    };

    rec.onresult = (event: any) => {
      if (this.isTtsActive()) return;

      const lastResultIndex = event.resultIndex;
      const result = event.results[lastResultIndex];
      const rawText = result[0].transcript;
      this.lastTranscript = rawText;
      
      const normalized = this.normalizeTranscript(rawText);
      this.lastNormalizedTranscript = normalized;
      this.notify();

      // Prevent self audio feedback loops
      const lastTTS = (window as any).lastAssistantTTS || '';
      if (lastTTS) {
        const similarity = this.getSelfAudioSimilarity(rawText, lastTTS);
        if (similarity > 0.90) {
          console.log('WAKE_DEBUG_SELF_AUDIO_IGNORED');
          this.selfAudioIgnoredCount++;
          this.notify();
          return;
        }
      }

      const matched = this.checkWakeWordMatch(normalized);
      if (matched) {
        this.handleWakeDetected(rawText);
      }
    };

    rec.onerror = (event: any) => {
      console.warn('[MoniRuntime] WakeWord Recognition error:', event.error);
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        this.lastError = event.error;
        this.wakeStatus = 'Error';
      }
      this.isStartingOrRunning = false;
      this.notify();
    };

    rec.onend = () => {
      this.isStartingOrRunning = false;
      if (this.isWakeWordListening && !this.isTtsActive() && !this.isWaitingForCommand) {
        this.wakeStatus = 'Restarting';
        this.notify();
        if (this.recognitionRestartTimer) clearTimeout(this.recognitionRestartTimer);
        this.recognitionRestartTimer = setTimeout(() => {
          if (this.isWakeWordListening && !this.isTtsActive() && !this.isWaitingForCommand) {
            this.startWakeWordListening();
          }
        }, 500);
      }
    };

    this.recognition = rec;
    try {
      rec.start();
    } catch (e) {
      console.error('[MoniRuntime] Error starting wake listener:', e);
      this.isStartingOrRunning = false;
    }
  }

  private async startCommandListening(isFirstStart: boolean = false) {
    if (typeof window === 'undefined' || !this.speechApiSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    this.destroyRecognition();
    this.isStartingOrRunning = true;
    this.runtimeState = 'WAITING_COMMAND';
    this.wakeStatus = 'Seni dinliyorum...';
    this.orbState = 'listening';
    this.notify();

    if (isFirstStart) {
      console.log('RUNTIME_ENTER_WAITING_COMMAND');
      if (this.commandTimeoutTimer) {
        clearTimeout(this.commandTimeoutTimer);
      }
      this.commandTimeoutTimer = setTimeout(() => {
        this.handleCommandTimeout();
      }, 20000);
    }

    const granted = await this.checkMicPermission();
    if (!granted) {
      this.wakeStatus = 'Error';
      this.isStartingOrRunning = false;
      this.notify();
      return;
    }

    this.wakeStatus = 'Seni dinliyorum...';
    this.notify();

    console.log('VOICE_ENGINE_CREATE_RECOGNITION_COMMAND');
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = this.currentLanguage === 'tr' ? 'tr-TR' : 'en-US';

    rec.onstart = () => {
      console.log('RUNTIME_COMMAND_RECOGNITION_START');
      this.isStartingOrRunning = false;
      this.notify();
    };

    rec.onresult = async (event: any) => {
      const lastResultIndex = event.resultIndex;
      const result = event.results[lastResultIndex];
      const transcript = result[0].transcript.trim();
      console.log('RUNTIME_COMMAND_TRANSCRIPT_RAW', transcript, 'isFinal:', result.isFinal);
      
      this.lastTranscript = transcript;
      this.notify();

      // Extend listening timeout since user has started/is actively speaking
      if (this.commandTimeoutTimer) {
        clearTimeout(this.commandTimeoutTimer);
        this.commandTimeoutTimer = setTimeout(() => {
          this.handleCommandTimeout();
        }, 20000);
      }

      if (result.isFinal) {
        if (transcript.length <= 1 || this.isSelfAudio(transcript)) {
          console.log('VOICE_ENGINE_COMMAND_REJECTED_SELF_AUDIO');
          this.selfAudioIgnoredCount++;
          this.notify();
          return;
        }

        console.log('VOICE_ENGINE_COMMAND_ACCEPTED');
        this.destroyRecognition();
        console.log('RUNTIME_COMMAND_SEND_MESSAGE');
        await this.sendMessage(transcript, 'voice');
      }
    };

    rec.onerror = (event: any) => {
      console.warn('[MoniRuntime] Command Recognition error:', event.error);
      if (event.error !== 'aborted') {
        this.lastError = event.error;
        this.wakeStatus = 'Error';
      }
      this.isStartingOrRunning = false;
      this.notify();
    };

    rec.onend = () => {
      this.isStartingOrRunning = false;
      if (this.isWakeWordListening && !this.isTtsActive()) {
        if (this.isWaitingForCommand) {
          this.wakeStatus = 'Restarting';
          this.notify();
          if (this.recognitionRestartTimer) clearTimeout(this.recognitionRestartTimer);
          this.recognitionRestartTimer = setTimeout(() => {
            if (this.isWakeWordListening && !this.isTtsActive() && this.isWaitingForCommand) {
              this.startCommandListening(false);
            }
          }, 500);
        } else {
          this.wakeStatus = 'Restarting';
          this.notify();
          if (this.recognitionRestartTimer) clearTimeout(this.recognitionRestartTimer);
          this.recognitionRestartTimer = setTimeout(() => {
            if (this.isWakeWordListening && !this.isTtsActive() && !this.isWaitingForCommand) {
              this.startWakeWordListening();
            }
          }, 500);
        }
      }
    };

    this.recognition = rec;
    try {
      rec.start();
    } catch (e) {
      console.error('[MoniRuntime] Error starting command listener:', e);
      this.isStartingOrRunning = false;
    }
  }

  private handleWakeDetected(rawText: string) {
    console.log('[MoniRuntime] Wake word detected. Raw transcript:', rawText);
    this.runtimeState = 'WAKE_DETECTED';
    this.orbState = 'listening';
    this.wakeStatus = 'Detected';
    this.destroyRecognition();

    const userName = (typeof window !== 'undefined' && localStorage.getItem('moni_user_name')) || "Metin";
    const responseText = `Buradayım ${userName}, seni dinliyorum.`;

    const assistantMsg = {
      id: 'assistant-' + Date.now(),
      role: 'assistant' as const,
      content: responseText,
      timestamp: new Date()
    };

    if (this.messagesCallback) {
      this.messagesCallback(prev => [...prev, assistantMsg]);
    }
    databaseService.saveChatMessage(assistantMsg);
    console.log('RUNTIME_GREETING_MESSAGE_ADDED');

    this.isWaitingForCommand = true;
    console.log('RUNTIME_GREETING_TTS_ATTEMPTED');
    this.speakResponse(responseText, true);
  }

  public simulateWake() {
    this.handleWakeDetected('Moni');
  }

  // --- TTS Controller Channels ---
  private isTtsActive(): boolean {
    if (typeof window === 'undefined') return false;
    const state = (window as any).moniVoiceState;
    return state === 'speaking' || state === 'preparing';
  }

  private async speakResponse(text: string, isGreeting: boolean = false) {
    if (!text.trim()) {
      this.returnToIdle();
      return;
    }

    if (isGreeting) {
      console.log('RUNTIME_GREETING_TTS_START');
    } else {
      console.log('RUNTIME_RESPONSE_TTS_START');
    }

    this.ttsStartedAt = Date.now();
    console.log('VOICE_ENGINE_TTS_START', this.ttsStartedAt);
    this.lastTtsText = text;

    this.runtimeState = isGreeting ? 'GREETING' : 'TTS';
    this.orbState = 'speaking';
    this.isSpeaking = true;
    this.wakeStatus = 'Paused (TTS)';
    this.notify();

    // Force recognition stop during synthesis
    this.destroyRecognition();

    const voiceProfile = 'selin';
    const options = {
      rate: this.speechRate,
      volume: this.speechVolume,
      voiceName: this.selectedSystemVoiceName
    };

    try {
      await voiceService.speak(
        text,
        voiceProfile,
        () => {
          this.handleTtsComplete(isGreeting);
        },
        options,
        (err) => {
          console.error('[MoniRuntime] speakResponse callback error:', err);
          this.handleTtsComplete(isGreeting);
        }
      );
    } catch (e) {
      console.error('[MoniRuntime] speakResponse error:', e);
      this.handleTtsComplete(isGreeting);
    }
  }

  private handleTtsComplete(isGreeting: boolean) {
    if (isGreeting) {
      console.log('RUNTIME_GREETING_TTS_END');
    } else {
      console.log('RUNTIME_RESPONSE_TTS_END');
    }

    console.log('VOICE_ENGINE_TTS_END_CONFIRMED');
    this.ttsEndedAt = Date.now();
    this.isSpeaking = false;
    if (typeof window !== 'undefined') {
      (window as any).moniVoiceState = 'idle';
    }
    this.notify();

    console.log('VOICE_ENGINE_SILENCE_COOLDOWN_START');
    
    const startCooldownTime = Date.now();
    const minCooldownDuration = 1500;
    
    const checkSpeakingAndRestart = () => {
      const elapsed = Date.now() - startCooldownTime;
      const isStillSpeaking = typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking;
      
      if (elapsed < minCooldownDuration || isStillSpeaking) {
        setTimeout(checkSpeakingAndRestart, 100);
      } else {
        console.log('VOICE_ENGINE_SILENCE_COOLDOWN_END');
        if (isGreeting) {
          this.startCommandListening(true);
        } else {
          console.log('VOICE_ENGINE_RETURN_WAKE');
          this.returnToIdle();
        }
      }
    };
    
    checkSpeakingAndRestart();
  }

  private handleCommandTimeout() {
    console.log('[MoniRuntime] Command timeout reached (10s). Returning to WAITING_WAKE.');
    this.commandTimeoutTimer = null;
    this.isWaitingForCommand = false;
    this.destroyRecognition();
    
    const timeoutMsg = {
      id: 'assistant-' + Date.now(),
      role: 'assistant' as const,
      content: "Komut algılanmadı, tekrar Moni diyerek beni çağırabilirsin.",
      timestamp: new Date()
    };
    if (this.messagesCallback) {
      this.messagesCallback(prev => [...prev, timeoutMsg]);
    }
    databaseService.saveChatMessage(timeoutMsg);

    this.returnToIdle();
  }

  private returnToIdle() {
    this.isSpeaking = false;
    this.isWaitingForCommand = false;
    this.runtimeState = 'IDLE';
    this.orbState = 'idle';

    if (this.isWakeWordListening) {
      console.log('RUNTIME_RETURN_WAITING_WAKE');
      this.startWakeWordListening();
    } else {
      this.wakeStatus = 'Idle';
      this.destroyRecognition();
      this.notify();
    }
  }

  // --- Coordination / Core Logic Pipeline ---
  public async sendMessage(text: string, source: 'voice' | 'keyboard' = 'keyboard') {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    if (this.commandTimeoutTimer) {
      clearTimeout(this.commandTimeoutTimer);
      this.commandTimeoutTimer = null;
    }
    this.isWaitingForCommand = false;

    this.runtimeState = 'PROCESSING';
    this.orbState = 'thinking';
    this.wakeStatus = 'Processing';
    this.notify();

    // 1. Save user query message
    const userMsgId = 'user-' + Date.now();
    const userMsg = {
      id: userMsgId,
      role: 'user' as const,
      content: trimmedText,
      timestamp: new Date()
    };
    if (this.messagesCallback) {
      this.messagesCallback(prev => [...prev, userMsg]);
    }
    await databaseService.saveChatMessage(userMsg);

    // 2. Refresh dashboard data if registered
    if (this.refreshDashboardDataCallback) {
      await this.refreshDashboardDataCallback();
    }

    // 3. Create placeholder assistant message
    const assistantMsgId = 'assistant-' + Date.now();
    const placeholderMsg = {
      id: assistantMsgId,
      role: 'assistant' as const,
      content: '',
      timestamp: new Date()
    };
    if (this.messagesCallback) {
      this.messagesCallback(prev => [...prev, placeholderMsg]);
    }

    const memories = await databaseService.getMemories();

    // Check Local Soru-Cevap (Knowledge Core)
    const localResult = knowledgeCore.handleQuery(trimmedText, this.currentLanguage === 'en', memories);
    if (localResult.resolved) {
      const localResponse = localResult.text;
      providerHealthMonitor.logSuccess('local');

      if (this.messagesCallback) {
        this.messagesCallback(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: localResponse };
          }
          return updated;
        });
      }

      await databaseService.saveChatMessage({
        id: assistantMsgId,
        role: 'assistant',
        content: localResponse,
        timestamp: new Date()
      });

      this.runtimeState = 'MEMORY';
      this.notify();

      console.log('RUNTIME_COMMAND_RESPONSE_RECEIVED');

      if (this.autoSpeakEnabled && source === 'voice') {
        await this.speakResponse(localResponse, false);
      } else {
        this.returnToIdle();
      }
      return;
    }

    // Main AI processing layer
    let finalReply = '';
    let success = false;

    this.runtimeState = 'PROVIDER';
    this.notify();

    // A. Main pipeline attempt: ExecutiveBrain Orchestration
    try {
      const brain = container.resolve<ExecutiveBrain>('ExecutiveBrain');
      const userName = memories.find(m => m.category === 'name')?.content || 'Metin';
      brain.setUserName(userName);

      finalReply = await brain.processInput(trimmedText, (chunk: string) => {
        finalReply += chunk;
        if (this.messagesCallback) {
          this.messagesCallback(prev => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx].role === 'assistant') {
              updated[lastIdx] = { ...updated[lastIdx], content: finalReply };
            }
            return updated;
          });
        }
      });

      if (finalReply && finalReply.trim()) {
        success = true;
      }
    } catch (err: any) {
      console.warn('[MoniRuntime] ExecutiveBrain failed, running legacy fallback...', err);
      eventBus.publish('LegacyFallbackUsed', { reason: err.message || String(err) });
    }

    // B. Legacy Fallback Mechanism (Secretary & Memory Engine)
    if (!success) {
      try {
        const textLower = trimmedText.toLowerCase();

        // 1. Check pending secretary commands
        if (this.pendingSecretary && this.setPendingSecretaryCallback) {
          const pending = this.pendingSecretary;
          this.setPendingSecretaryCallback(null);

          if (pending.waitingFor === 'confirmation') {
            const isYes = ['evet', 'tamam', 'olur', 'ekle', 'kaydet', 'onaylıyorum', 'onayliyorum', 'yes', 'onayla'].some(word => textLower.includes(word));
            if (isYes) {
              const res = await SecretaryService.saveCommand(pending.type, pending.data, memories.find(m => m.category === 'name')?.content || 'Metin');
              finalReply = res.message;
              if (this.refreshDashboardDataCallback) await this.refreshDashboardDataCallback();
            } else {
              finalReply = this.currentLanguage === 'en' ? "Understood, cancelled the operation." : "Anlaşıldı, işlemi iptal ettim.";
            }
            success = true;
          } else if (pending.waitingFor === 'date_clarification') {
            const clarifiedDate = DateParserHelper.parse(trimmedText);
            if (clarifiedDate) {
              const updatedData = { ...pending.data, dateTime: clarifiedDate };
              const friendlyDate = SecretaryService.formatTurkishFriendlyDate(clarifiedDate);
              const label = pending.type === 'task' ? 'görev' : pending.type === 'reminder' ? 'hatırlatıcı' : 'toplantı';
              this.setPendingSecretaryCallback({
                ...pending,
                data: updatedData,
                waitingFor: 'confirmation'
              });
              finalReply = this.currentLanguage === 'en' ? 
                `Understood. Would you like me to add this as a ${label} for ${friendlyDate}?` :
                `Tamamdır. Bunu ${friendlyDate} için ${label} olarak eklememi onaylıyor musunuz?`;
            } else {
              this.setPendingSecretaryCallback(pending);
              finalReply = this.currentLanguage === 'en' ? 
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
          const secretaryResult = await SecretaryService.processCommand(trimmedText, activeProjects, userName, undefined);

          if (secretaryResult.type !== 'chat') {
            if (secretaryResult.waitingFor && this.setPendingSecretaryCallback) {
              this.setPendingSecretaryCallback({
                type: secretaryResult.type,
                data: secretaryResult.data,
                originalText: trimmedText,
                waitingFor: secretaryResult.waitingFor
              });
              finalReply = secretaryResult.message;
            } else if (secretaryResult.success) {
              finalReply = secretaryResult.message;
              if (this.refreshDashboardDataCallback) await this.refreshDashboardDataCallback();
            } else {
              finalReply = this.currentLanguage === 'en' ? "Sorry, a problem occurred while processing the command." : "Üzgünüm, komutu işlerken bir sorun oluştu.";
            }
            success = true;
          }
        }

        // 3. Memory Service Extraction
        if (!success) {
          if (MemoryService.shouldSaveMemory(trimmedText)) {
            const extracted = await MemoryService.extractMemoryFromText(trimmedText, undefined);
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
              if (this.refreshDashboardDataCallback) await this.refreshDashboardDataCallback();
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
            if (this.refreshDashboardDataCallback) await this.refreshDashboardDataCallback();
            success = true;
          }
        }

        // 4. Default Legacy AI Stream fallback
        if (!success) {
          const fallbackInstruction = "Sen Moni adında, son derece zeki, cana yakın ve profesyonel bir yapay zeka asistanı ve özel kalem yöneticisisin. Cevapların kısa, net, samimi ve sesli okumaya tam uyumlu olmalıdır.";
          let accumulatedText = '';

          await voiceService.streamChat(
            trimmedText,
            (chunk: string) => {
              accumulatedText += chunk;
              if (this.messagesCallback) {
                this.messagesCallback(prev => {
                  if (prev.length === 0) return prev;
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (updated[lastIdx].role === 'assistant') {
                    updated[lastIdx] = { ...updated[lastIdx], content: accumulatedText };
                  }
                  return updated;
                });
              }
            },
            undefined,
            [],
            fallbackInstruction,
            this.activeProvider
          );

          finalReply = accumulatedText.trim();
          success = true;
          providerHealthMonitor.logSuccess(this.activeProvider);
        }

      } catch (fallbackErr: any) {
        console.error('[MoniRuntime] Fallback query failed:', fallbackErr);
        const isRate = !!(fallbackErr.message && (fallbackErr.message.includes('429') || fallbackErr.message.toLowerCase().includes('rate_limit') || fallbackErr.message.toLowerCase().includes('quota') || fallbackErr.message.toLowerCase().includes('limit aşımına')));
        providerHealthMonitor.logFailure(this.activeProvider, isRate);
        
        if (isRate) {
          finalReply = this.currentLanguage === 'en'
            ? "Yapay zeka servis limitleri şu an dolu (429 Rate Limit). Lütfen yerel araçları kullanmaya devam edin."
            : "Yapay zeka servis limitleri şu an dolu (429 Kota Aşımı). Yerel araçlar üzerinden çalışmanıza devam edebilirsiniz.";
        } else {
          if (this.currentLanguage === 'en') {
            finalReply = "Online AI providers are currently unavailable, but I can still help locally with MONI features, help, memory, voice, and workspace topics.";
          } else {
            finalReply = "Şu anda çevrim içi yapay zeka sağlayıcıları yanıt veremiyor, ancak temel MONI bilgileri, yardım, hafıza, ses ve çalışma alanı konularında sana yerel olarak yardımcı olabilirim.";
          }
        }
      }
    }

    // 5. Save finalized assistant reply to database
    if (this.messagesCallback) {
      this.messagesCallback(prev => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = { ...updated[lastIdx], content: finalReply };
        }
        return updated;
      });
    }

    const finalAiMsg = {
      id: assistantMsgId,
      role: 'assistant' as const,
      content: finalReply,
      timestamp: new Date()
    };
    await databaseService.saveChatMessage(finalAiMsg);

    this.runtimeState = 'MEMORY';
    this.notify();

    // 6. Refresh UI lists again
    if (this.refreshDashboardDataCallback) {
      await this.refreshDashboardDataCallback();
    }

    console.log('RUNTIME_COMMAND_RESPONSE_RECEIVED');

    // 7. TTS playback if voice source
    if (this.autoSpeakEnabled && source === 'voice' && finalReply.trim() && !finalReply.includes('çevrim içi yapay zeka sağlayıcıları') && !finalReply.includes('Online AI providers are currently unavailable')) {
      await this.speakResponse(finalReply, false);
    } else {
      this.returnToIdle();
    }
  }

  // --- Helper Methods ---
  private async checkMicPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.micPermission = 'Unknown';
      this.notify();
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.micStream = stream;
      const track = stream.getAudioTracks()[0];
      if (track) {
        const settings = track.getSettings();
        this.echoCancellationEnabled = settings.echoCancellation !== false;
        this.noiseSuppressionEnabled = settings.noiseSuppression !== false;
        this.autoGainEnabled = settings.autoGainControl !== false;
      }

      this.micPermission = 'Granted';
      this.notify();
      return true;
    } catch (e: any) {
      console.error('[MoniRuntime] Microphone permission denied', e);
      this.micPermission = 'Denied';
      this.lastError = e.message || String(e);
      this.notify();
      return false;
    }
  }

  // --- Helpers for Normalization, Wake word & Similarity check ---
  private normalizeTranscript(text: string): string {
    if (!text) return '';
    return text
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'i')
      .replace(/ş/g, 's')
      .replace(/Ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/Ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/Ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/Ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'c')
      .toLowerCase()
      .trim();
  }

  private checkWakeWordMatch(normalized: string): boolean {
    const words = normalized.split(/[^a-z0-9]/).filter(Boolean);
    const wakeTargets = ['moni', 'monı', 'money', 'mone'];
    const hasWakeWord = words.some(w => wakeTargets.includes(w));
    if (!hasWakeWord) return false;
    
    const phrases = ['moni', 'hey moni', 'merhaba moni', 'moni dinle', 'alo moni', 'monı', 'hey monı', 'merhaba monı', 'monı dinle', 'alo monı'];
    const cleanText = ' ' + words.join(' ') + ' ';
    return phrases.some(phrase => {
      const cleanPhrase = phrase.split(/[^a-z0-9]/).filter(Boolean).join(' ');
      return cleanText.includes(' ' + cleanPhrase + ' ');
    });
  }

  private cleanString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  private isSelfAudio(transcript: string): boolean {
    const now = Date.now();
    const cleanT = this.cleanString(this.normalizeTranscript(transcript));

    const allowedShortCommands = ['merhaba', 'nasilsin', 'nasilsiniz', 'devam et', 'anlat', 'tamam'];
    if (allowedShortCommands.includes(cleanT)) {
      console.log('BYPASS_SELF_AUDIO_CHECK_FOR_NATURAL_SHORT_COMMAND:', cleanT);
      return false;
    }

    // 1. Cooldown check
    if (now - this.ttsEndedAt < 1500) {
      console.log('SELF_AUDIO_IGNORED_COOLDOWN');
      return true;
    }

    // 2. Similarity check
    if (this.lastTtsText) {
      const similarity = this.getSelfAudioSimilarity(transcript, this.lastTtsText);
      if (similarity > 0.60) {
        console.log('SELF_AUDIO_IGNORED_SIMILARITY');
        return true;
      }
    }

    // 3. Greeting phrases check
    if (
      cleanT.includes('buradayim') ||
      cleanT.includes('seni dinliyorum') ||
      cleanT.includes('nasil yardimci') ||
      cleanT.includes('yardimci olabilirim') ||
      cleanT.includes('merhaba metin ben de seni dinliyorum')
    ) {
      console.log('SELF_AUDIO_IGNORED_GREETING_PHRASE');
      return true;
    }

    return false;
  }

  private getSelfAudioSimilarity(transcript: string, tts: string): number {
    const cleanT = this.cleanString(this.normalizeTranscript(transcript));
    const cleanTTS = this.cleanString(this.normalizeTranscript(tts));
    
    if (!cleanT || !cleanTTS) return 0;
    
    if (cleanT === cleanTTS) return 1.0;
    
    return this.computeSimilarity(cleanT, cleanTTS);
  }

  private computeSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    return (longerLength - this.editDistance(longer, shorter)) / longerLength;
  }

  private editDistance(s1: string, s2: string): number {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }
}

export const moniRuntime = MoniRuntime.getInstance();
if (typeof window !== 'undefined') {
  (window as any).moniRuntime = moniRuntime;
}
