import { getEndpoint } from '../../config/api';

export interface SpeechVoice {
  name: string;
  gender: 'female' | 'male';
  pitch: number;
  rate: number;
}

export class VoiceService {
  private static instance: VoiceService;
  private voices: SpeechSynthesisVoice[] = [];
  private elevenLabsDisabled = true; // Optional adapter default state
  
  public voiceState: 'idle' | 'preparing' | 'speaking' | 'cancelled' | 'fallback' = 'idle';

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private constructor() {
    this.loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public getAvailableTrVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(v =>
      v.lang.toLowerCase().replace('_', '-').startsWith('tr') ||
      v.lang.toLowerCase().includes('tr')
    );
  }

  private updateVoiceState(state: 'idle' | 'preparing' | 'speaking' | 'cancelled' | 'fallback') {
    this.voiceState = state;
    if (typeof window !== 'undefined') {
      (window as any).moniVoiceState = state;
      window.dispatchEvent(new CustomEvent('moni_voice_state_changed', { detail: { state } }));
    }
  }

  public cancelAllSpeech() {
    this.updateVoiceState('cancelled');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (typeof window !== 'undefined') {
      const audio = (window as any).moniAudio as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        if (audio.src && audio.src.startsWith('blob:')) {
          try { URL.revokeObjectURL(audio.src); } catch (_) {}
        }
        audio.src = '';
      }
    }
    setTimeout(() => this.updateVoiceState('idle'), 100);
  }

  public async streamChat(
    message: string,
    onChunk: (text: string) => void,
    apiKey?: string,
    history?: any[],
    systemInstruction?: string,
    provider?: string
  ): Promise<void> {
    const targetUrl = getEndpoint('chat/stream');
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, apiKey, history, systemInstruction, provider }),
      });
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      if (!response.body) throw new Error('ReadableStream not supported.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanedLine = line.trim();
          if (cleanedLine.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(cleanedLine.substring(6));
              if (jsonData.text) onChunk(jsonData.text);
            } catch (_) {}
          }
        }
      }
    } catch (e: any) {
      console.error('[MONI AI] streamChat failed:', e);
      throw e;
    }
  }

  public async deepgramStt(audioBlob: Blob): Promise<string> {
    const url = getEndpoint('stt/deepgram');
    const formData = new FormData();
    formData.append('audio', audioBlob, 'record.wav');

    const response = await fetch(url, { method: 'POST', body: formData });
    if (!response.ok) throw new Error(`STT failed: ${response.status}`);

    const data = await response.json();
    return data.transcript || '';
  }

  public async openAiTts(
    text: string,
    options?: { rate?: number; volume?: number }
  ): Promise<HTMLAudioElement> {
    const url = getEndpoint('tts');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim().slice(0, 4096) })
    });
    if (!response.ok) throw new Error(`ElevenLabs TTS failed: ${response.status}`);

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);

    let audio = (window as any).moniAudio as HTMLAudioElement;
    if (!audio) {
      audio = new Audio();
      (window as any).moniAudio = audio;
    }
    if (audio.src && audio.src.startsWith('blob:')) {
      try { URL.revokeObjectURL(audio.src); } catch (_) {}
    }
    audio.src = audioUrl;
    if (options && options.volume !== undefined) audio.volume = options.volume;
    return audio;
  }

  public testBrowserTTS(text: string) {
    console.log('BROWSER_TTS_TEST_START');
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (!isSupported) {
      console.error('BROWSER_TTS_TEST_ERROR: SpeechSynthesis not supported');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          (window as any).activeUtterance = utterance;
          utterance.lang = "tr-TR";
          utterance.rate = 0.95;
          utterance.pitch = 1;
          utterance.volume = 1;

          utterance.onend = () => console.log('BROWSER_TTS_TEST_END');
          utterance.onerror = (e) => console.error('BROWSER_TTS_TEST_ERROR', e);

          const trVoice = window.speechSynthesis.getVoices().find(v =>
            v.lang.toLowerCase().includes('tr')
          );
          if (trVoice) utterance.voice = trVoice;

          window.speechSynthesis.speak(utterance);
        } catch (inner: any) {
          console.error('BROWSER_TTS_TEST_ERROR', inner);
        }
      }, 250);
    } catch (e: any) {
      console.error('BROWSER_TTS_TEST_ERROR', e);
    }
  }

  public async speak(
    text: string,
    profile: 'selin' | 'derin' | 'google-assistant' | 'gemini-vega' | 'gemini-ursa',
    onEnd?: () => void,
    options?: { rate?: number; volume?: number; voiceName?: string; preferredMode?: string },
    onError?: (errMessage: string) => void
  ): Promise<void> {
    if (typeof window !== 'undefined') {
      (window as any).lastAssistantTTS = text;
    }
    this.cancelAllSpeech();
    this.updateVoiceState('preparing');

    if (options && options.preferredMode === 'elevenlabs' && !this.elevenLabsDisabled) {
      try {
        console.log('[MONI TTS] ElevenLabs optional adapter speaking...');
        const audio = await this.openAiTts(text, options);
        this.updateVoiceState('speaking');
        audio.onended = () => {
          this.updateVoiceState('idle');
          if (onEnd) onEnd();
        };
        audio.onerror = (e) => {
          console.warn('[MONI TTS] ElevenLabs failed, falling back to local:', e);
          this.updateVoiceState('fallback');
          this.speakWithLocalSpeechSynthesis(text, profile, onEnd, options, onError);
        };
        await audio.play();
        return;
      } catch (err: any) {
        console.warn('[MONI TTS] ElevenLabs initialization error:', err);
      }
    }

    this.updateVoiceState('fallback');
    this.speakWithLocalSpeechSynthesis(text, profile, onEnd, options, onError);
  }

  public static speakBrowser(text: string): Promise<void> {
    return VoiceService.getInstance().speak(text, 'selin');
  }

  public async speakBrowser(text: string): Promise<void> {
    return this.speak(text, 'selin');
  }

  private async loadAndSelectVoice(): Promise<SpeechSynthesisVoice | null> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null;
    }

    let voices = window.speechSynthesis.getVoices();
    console.log('BROWSER_TTS_VOICES_COUNT', voices.length);

    if (voices.length === 0) {
      await new Promise<void>((resolve) => {
        const checkVoices = () => {
          voices = window.speechSynthesis.getVoices();
          console.log('BROWSER_TTS_VOICES_COUNT', voices.length);
          if (voices.length > 0) {
            resolve();
          } else {
            setTimeout(checkVoices, 100);
          }
        };
        
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          console.log('BROWSER_TTS_VOICES_COUNT', voices.length);
          if (voices.length > 0) {
            resolve();
          }
        };
        
        setTimeout(checkVoices, 50);
      });
    }

    const trVoices = voices.filter(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return (
        lang.includes('tr') ||
        name.includes('turkish') ||
        name.includes('türkçe')
      );
    });

    let selected: SpeechSynthesisVoice | null = null;
    
    if (trVoices.length > 0) {
      selected = trVoices.find(v => v.name.toLowerCase().includes('selin')) || null;
      if (!selected) selected = trVoices.find(v => v.name.toLowerCase().includes('zeynep')) || null;
      if (!selected) selected = trVoices.find(v => v.name.toLowerCase().includes('emel')) || null;
      if (!selected) selected = trVoices.find(v => v.name.toLowerCase().includes('google')) || null;
      if (!selected) selected = trVoices.find(v => !v.name.toLowerCase().includes('tolga')) || null;
      if (!selected) selected = trVoices[0];
    }

    if (!selected && voices.length > 0) {
      selected = voices.find(v => {
        const name = v.name.toLowerCase();
        return name.includes('female') || name.includes('zira') || name.includes('susan') || name.includes('hazel');
      }) || voices[0];
    }

    if (selected) {
      console.log('BROWSER_TTS_SELECTED_VOICE', selected.name);
    } else {
      console.log('BROWSER_TTS_SELECTED_VOICE', 'none');
    }
    return selected;
  }

  private async speakWithLocalSpeechSynthesis(
    text: string,
    profile: 'selin' | 'derin' | 'google-assistant' | 'gemini-vega' | 'gemini-ursa',
    onEnd?: () => void,
    options?: { rate?: number; volume?: number; voiceName?: string; preferredMode?: string },
    onError?: (errMessage: string) => void
  ) {
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    console.log(`[MONI TTS] TTS destekleniyor mu: ${isSupported}`, { profile, options });

    let fallbackTimer: any = null;
    let isCallbackCalled = false;

    const triggerEnd = () => {
      if (isCallbackCalled) return;
      isCallbackCalled = true;
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      console.log('TTS_ONEND_TRIGGERED');
      this.updateVoiceState('idle');
      if (onEnd) onEnd();
    };

    const triggerError = (errMsg: string) => {
      if (isCallbackCalled) return;
      isCallbackCalled = true;
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      console.log('TTS_ONERROR_TRIGGERED');
      this.updateVoiceState('idle');
      if (onError) onError(errMsg);
      else if (onEnd) onEnd();
    };

    if (!isSupported) {
      triggerError("Tarayıcınız yerel ses sentezlemeyi (SpeechSynthesis) desteklemiyor.");
      return;
    }

    if (!(window as any).__moniTtsUnlocked) {
      const warningMsg = "Ses çıkışı için önce Tarayıcı Ses Testi butonuna basın.";
      console.warn(warningMsg);
      const notificationEvent = new CustomEvent('moni_info_notification', {
        detail: { message: warningMsg }
      });
      window.dispatchEvent(notificationEvent);
    }

    try {
      this.updateVoiceState('speaking');
      const voice = await this.loadAndSelectVoice();

      const utterance = new SpeechSynthesisUtterance(text);
      (window as any).activeUtterance = utterance;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = "tr-TR";
      utterance.rate = options?.rate !== undefined ? options.rate : 0.95;
      utterance.pitch = 1.08;
      utterance.volume = options?.volume !== undefined ? options.volume : 1.0;

      utterance.onstart = () => {
        console.log('BROWSER_TTS_START');
      };

      utterance.onend = () => {
        console.log('BROWSER_TTS_ONEND');
        triggerEnd();
      };

      utterance.onerror = (event: any) => {
        console.log('BROWSER_TTS_ONERROR');
        if (event.error === 'blocked') console.log('BROWSER_TTS_BLOCKED_BY_BROWSER');
        triggerError(`Yerel ses hatası: ${event.error || 'Bilinmeyen Hata'}`);
      };

      window.speechSynthesis.cancel();

      setTimeout(() => {
        try {
          console.log('BROWSER_TTS_SPEAK_CALLED');
          window.speechSynthesis.speak(utterance);

          const estimatedDuration = Math.max(5000, text.length * 120 + 2000);
          fallbackTimer = setTimeout(() => {
            console.log('TTS_TIMEOUT_FALLBACK_TRIGGERED');
            
            const startTime = Date.now();
            const maxEmergencyTime = 15000;
            
            const checkStatusAndRelease = () => {
              if (isCallbackCalled) return;
              const elapsed = Date.now() - startTime;
              const isSpeaking = window.speechSynthesis.speaking;
              const isPending = window.speechSynthesis.pending;
              
              if ((isSpeaking || isPending) && elapsed < maxEmergencyTime) {
                console.log('TTS_TIMEOUT_WAITING_STILL_SPEAKING');
                setTimeout(checkStatusAndRelease, 250);
              } else {
                if (elapsed >= maxEmergencyTime) {
                  console.log('TTS_EMERGENCY_RELEASE');
                  try { window.speechSynthesis.cancel(); } catch (_) {}
                } else {
                  console.log('TTS_TIMEOUT_COMPLETED_AFTER_SILENCE');
                }
                triggerEnd();
              }
            };
            
            checkStatusAndRelease();
          }, estimatedDuration);
        } catch (inner: any) {
          triggerError(inner.message || String(inner));
        }
      }, 250);

    } catch (e: any) {
      triggerError(`Yerel ses sentezleme başlatılamadı: ${e.message || e}`);
    }
  }
}

export const voiceService = VoiceService.getInstance();
