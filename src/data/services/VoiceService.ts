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
  
  public voiceState: 'idle' | 'preparing' | 'speaking' | 'cancelled' | 'fallback' = 'idle';

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
          try {
            URL.revokeObjectURL(audio.src);
          } catch (_) {}
        }
        audio.src = '';
      }
    }
    setTimeout(() => {
      this.updateVoiceState('idle');
    }, 100);
  }

  private constructor() {
    this.loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
        console.log(`[MONI TTS] onvoiceschanged tetiklendi. Yüklenen yerel ses sayısı: ${this.voices.length}`);
      };
    }
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public getAvailableTrVoices(): SpeechSynthesisVoice[] {
    this.loadVoices();
    return this.voices.filter(v =>
      v.lang.toLowerCase().replace('_', '-').startsWith('tr') ||
      v.lang.toLowerCase().includes('tr')
    );
  }

  /**
   * Streams response from Gemini via backend stream endpoint.
   */
  public async streamChat(
    message: string,
    onChunk: (text: string) => void,
    apiKey?: string,
    history?: any[],
    systemInstruction?: string,
    provider?: string
  ): Promise<void> {
    const t = () => new Date().toISOString();
    console.log(`\n======== AI REQUEST [${t()}] ========`);
    console.log(`[AI-1] Kullanıcı Mesajı:\n"${message}"`);
    console.log(`[AI-2] ${provider || 'Varsayılan'} isteği hazırlanıyor`);
    console.log(`[AI-3] Model:\n${provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-2.5-flash'}`);

    const targetUrl = getEndpoint('chat/stream');
    console.log(`[AI-4] API isteği gönderildi [Target: ${targetUrl}]`);

    let response;
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, apiKey, history, systemInstruction, provider }),
      });
    } catch (netErr: any) {
      console.error(`[AI-5] HTTP Status: Network Error [${t()}]`);
      console.error('[MONI AI] Network error connecting to backend:', netErr);
      console.log('============================\n');
      throw new Error(`Network Error: ${netErr.message || 'Connection refused/failed'}`);
    }

    console.log(`[AI-5] HTTP Status:\n${response.status}`);

    if (!response.ok) {
      let errBody = '';
      try {
        errBody = await response.text();
      } catch (_) {}
      console.error(`[AI-6] Ham Gemini cevabı (Hata):\n${errBody}`);
      console.log('============================\n');
      throw new Error(`HTTP Error ${response.status}: ${errBody || response.statusText}`);
    }

    console.log('[AI-7] Stream başladı');

    if (!response.body) {
      console.log('============================\n');
      throw new Error('ReadableStream desteklenmiyor.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulated = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Store incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const cleanedLine = line.trim();
        if (cleanedLine.startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(cleanedLine.substring(6));
            if (jsonData.text) {
              accumulated += jsonData.text;
              onChunk(jsonData.text);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    console.log('[AI-8] Stream tamamlandı');
    console.log(`[AI-6] Ham Gemini cevabı:\n"${accumulated}"`);
    console.log(`[AI-9] Toplam karakter:\n${accumulated.length}`);
    console.log('[AI-10] TTS gönderiliyor');
    console.log('============================\n');
  }

  /**
   * Sends audio blob to backend Deepgram STT endpoint.
   */
  public async deepgramStt(audioBlob: Blob): Promise<string> {
    const url = getEndpoint('stt/deepgram');

    const formData = new FormData();
    formData.append('audio', audioBlob, 'record.wav');

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Deepgram STT failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.transcript || '';
  }

  /**
   * openAiTts — Calls the backend /api/tts endpoint which proxies OpenAI TTS.
   * Returns an HTMLAudioElement ready to play, or throws on failure.
   * The OpenAI API key stays on the server — never exposed to the browser.
   */
  public async openAiTts(
    text: string,
    options?: { rate?: number; volume?: number }
  ): Promise<HTMLAudioElement> {
    const url = getEndpoint('tts');
    
    console.log('[MONI TTS] Backend URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim().slice(0, 4096) })
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Backend TTS ${response.status}: ${errBody}`);
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);

    let audio = (window as any).moniAudio as HTMLAudioElement;
    if (!audio) {
      audio = new Audio();
      (window as any).moniAudio = audio;
    }

    // Revoke previous object URL to free memory
    if (audio.src && audio.src.startsWith('blob:')) {
      URL.revokeObjectURL(audio.src);
    }

    audio.src = audioUrl;
    if (options?.volume !== undefined) audio.volume = options.volume;
    if (options?.rate !== undefined) audio.playbackRate = options.rate;

    return audio;
  }

  /**
   * speak — TTS priority chain:
   *   1. ElevenLabs TTS via /api/tts backend
   *   2. Google Cloud TTS
   *   3. Browser Web Speech API (local fallback, quality varies by device)
   */
  public async speak(
    text: string,
    profile: 'selin' | 'derin' | 'google-assistant' | 'gemini-vega' | 'gemini-ursa',
    onEnd?: () => void,
    options?: { rate?: number; volume?: number; voiceName?: string; preferredMode?: string },
    onError?: (errMessage: string) => void
  ) {
    // 0. Interrupt previous speech and lock
    this.cancelAllSpeech();
    this.updateVoiceState('preparing');

    const isIOS = typeof navigator !== 'undefined' &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    const isSafari = typeof navigator !== 'undefined' &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome/.test(navigator.userAgent);

    let elevenLabsSucceeded = false;

    // ── 1. Try ElevenLabs TTS via backend ─────────────────────────────────────
    try {
      const audio = await this.openAiTts(text, options);
      
      elevenLabsSucceeded = true;
      this.updateVoiceState('speaking');

      audio.onended = () => {
        this.updateVoiceState('idle');
        if (onEnd) onEnd();
      };
      
      audio.onerror = (errEvent: any) => {
        console.warn('[MONI TTS] ElevenLabs çalma hatası. Yerel ses motoru devreye giriyor.', errEvent);
        this.updateVoiceState('fallback');
        this.speakWithLocalSpeechSynthesis(text, profile, onEnd, options, onError);
      };

      await audio.play();
      console.log('[MONI TTS] ElevenLabs kadın sesi aktif');
      return; // Success
    } catch (e: any) {
      elevenLabsSucceeded = false;
      const isPaidPlanError = e.message && (e.message.includes('402') || e.message.includes('payment_required') || e.message.includes('paid_plan'));
      
      if (isPaidPlanError) {
        console.warn('[MONI TTS] ElevenLabs Premium doğal kadın sesi için plan yükseltilmeli. Yerel ses kullanılıyor.');
        const notificationEvent = new CustomEvent('moni_info_notification', {
          detail: { message: 'Kota doldu, yerel ses motoru kullanılıyor.' }
        });
        window.dispatchEvent(notificationEvent);
      } else {
        console.warn('[MONI TTS] ElevenLabs TTS başarısız, Google Cloud TTS deneniyor:', e.message);
      }
    }

    if (elevenLabsSucceeded) return;

    // ── 2. Try Google Cloud TTS ───────────────────────────────────────────
    const googleApiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY || '';
    if (googleApiKey.trim() && !isIOS && !isSafari) {
      try {
        let voiceName = 'tr-TR-Wavenet-C';
        let gender = 'FEMALE';
        let pitch = 0.0;
        let speakingRate = 1.0;

        switch (profile) {
          case 'selin':    voiceName = 'tr-TR-Standard-A'; pitch = 1.0; break;
          case 'derin':    voiceName = 'tr-TR-Wavenet-C';  pitch = 2.0; break;
          case 'google-assistant': voiceName = 'tr-TR-Wavenet-C'; pitch = 0.0; break;
          case 'gemini-vega': voiceName = 'tr-TR-Wavenet-C'; pitch = 4.0; speakingRate = 1.05; break;
          case 'gemini-ursa': voiceName = 'tr-TR-Wavenet-C'; pitch = -2.0; break;
        }

        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`;
        const activeRate = options?.rate !== undefined ? options.rate : speakingRate;
        const volumeGainDb = options?.volume !== undefined ? 20 * Math.log10(options.volume || 0.001) : 0.0;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: 'tr-TR', name: voiceName, ssmlGender: gender },
            audioConfig: { audioEncoding: 'MP3', pitch, speakingRate: activeRate, volumeGainDb }
          })
        });

        if (!response.ok) throw new Error(`Google Cloud TTS API Hatası: ${response.status}`);

        const data = await response.json();
        if (data.audioContent) {
          const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;

          let audio = (window as any).moniAudio as HTMLAudioElement;
          if (!audio) { audio = new Audio(); (window as any).moniAudio = audio; }

          this.updateVoiceState('speaking');
          audio.src = audioUrl;
          if (options?.volume !== undefined) audio.volume = options.volume;
          audio.onended = () => { this.updateVoiceState('idle'); if (onEnd) onEnd(); };
          audio.onerror = (errEvent: any) => {
            console.error('Google Cloud TTS ses oynatma hatası:', errEvent);
            this.updateVoiceState('fallback');
            this.speakWithLocalSpeechSynthesis(text, profile, onEnd, options, onError);
          };
          await audio.play();
          console.log('[MONI TTS] Google Cloud TTS ile seslendirildi.');
          return; // Success
        }
      } catch (e: any) {
        console.warn('[MONI TTS] Google Cloud TTS başarısız, yerel ses motoruna geçiliyor:', e.message);
      }
    }

    // ── 3. Web Speech API fallback ────────────────────────────────────────
    this.updateVoiceState('fallback');
    this.speakWithLocalSpeechSynthesis(text, profile, onEnd, options, onError);
  }

  /**
   * Browser SpeechSynthesis Fallback engine
   */
  private speakWithLocalSpeechSynthesis(
    text: string,
    profile: 'selin' | 'derin' | 'google-assistant' | 'gemini-vega' | 'gemini-ursa',
    onEnd?: () => void,
    options?: { rate?: number; volume?: number; voiceName?: string; preferredMode?: string },
    onError?: (errMessage: string) => void
  ) {
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    console.log(`[MONI TTS] TTS destekleniyor mu: ${isSupported}`);

    if (!isSupported) {
      const err = "Tarayıcınız yerel ses sentezlemeyi (SpeechSynthesis) desteklemiyor.";
      console.warn(err);
      this.updateVoiceState('idle');
      if (onError) onError(err);
      else if (onEnd) onEnd();
      return;
    }

    try {
      this.loadVoices();
      
      window.speechSynthesis.cancel();

      if (this.voices.length === 0) {
        console.warn("[MONI TTS] Cihazda sesli okuma motoru bulunamadı, sessiz metin modu aktif.");
        const words = text.trim().split(/\s+/).length;
        const estimatedDuration = Math.max(1500, words * 350);
        this.updateVoiceState('speaking');
        setTimeout(() => {
          this.updateVoiceState('idle');
          if (onEnd) onEnd();
        }, estimatedDuration);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const currentLang = (typeof window !== 'undefined' && localStorage.getItem('moni_language')) || 'tr';

      if (currentLang === 'en') {
        utterance.lang = 'en-US';
      } else {
        utterance.lang = 'tr-TR';
      }

      const isMaleVoice = (name: string) =>
        /tolga|cem|hakan|sabri|huseyin|male|erkek|man\b|boy|david|mark|microsoft zira/i.test(name);

      let selectedVoice: SpeechSynthesisVoice | null = null;
      let trVoices: SpeechSynthesisVoice[] = [];
      let femaleTrVoices: SpeechSynthesisVoice[] = [];

      const preferredMode = options?.preferredMode || localStorage.getItem('moni_preferred_voice_mode') || 'auto';

      trVoices = this.voices.filter(v =>
        v.lang.toLowerCase().replace('_', '-').startsWith('tr') ||
        v.lang.toLowerCase().includes('tr')
      );

      // Trigger Turkish voice warning if lang is TR but no Turkish voice is on system
      if (currentLang === 'tr' && trVoices.length === 0) {
        const warningMsg = 'Türkçe sistem sesi bulunamadı, varsayılan ses kullanılıyor.';
        console.warn(warningMsg);
        const notificationEvent = new CustomEvent('moni_info_notification', {
          detail: { message: warningMsg }
        });
        window.dispatchEvent(notificationEvent);
      }

      if (preferredMode === 'turkish') {
        selectedVoice = trVoices.find(v => !isMaleVoice(v.name)) || trVoices[0] || null;
      } else if (preferredMode === 'english') {
        selectedVoice = this.voices.find(v => (v.lang.toLowerCase().startsWith('en') && !isMaleVoice(v.name))) || null;
      } else if (preferredMode === 'male') {
        selectedVoice = this.voices.find(v => isMaleVoice(v.name)) || null;
      } else if (preferredMode === 'female') {
        selectedVoice = this.voices.find(v => !isMaleVoice(v.name)) || null;
      }

      if (!selectedVoice) {
        if (currentLang === 'en') {
          const enVoices = this.voices.filter(v =>
            v.lang.toLowerCase().replace('_', '-').startsWith('en') ||
            v.lang.toLowerCase().includes('en')
          );
          selectedVoice = enVoices.find(v => !isMaleVoice(v.name)) || enVoices[0] || null;
        } else {
          femaleTrVoices = trVoices.filter(v => {
            const name = v.name.toLowerCase();
            return (/dilara|yelda|emel|seda|filiz|sibel/i.test(name) || name.includes('google')) && !isMaleVoice(name);
          });
          selectedVoice = femaleTrVoices[0] || trVoices.find(v => !isMaleVoice(v.name)) || trVoices[0] || null;
        }
      }

      if (!selectedVoice) {
        selectedVoice = this.voices.find(v => v.default) || this.voices[0] || null;
      }

      if (options?.voiceName) {
        const customSelected = this.voices.find(v => v.name === options.voiceName);
        if (customSelected) selectedVoice = customSelected;
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        console.warn("[MONI TTS] Seçilen ses nesnesi alınamadı. Sessiz metin modu aktif.");
        this.updateVoiceState('speaking');
        const words = text.trim().split(/\s+/).length;
        setTimeout(() => {
          this.updateVoiceState('idle');
          if (onEnd) onEnd();
        }, Math.max(1500, words * 350));
        return;
      }

      this.updateVoiceState('speaking');

      let pitch = 1.0;
      let rate = 1.0;
      const isCurrentlyMale = selectedVoice ? isMaleVoice(selectedVoice.name) : false;

      switch (profile) {
        case 'selin': pitch = 1.05; break;
        case 'derin': pitch = 1.20; rate = 0.95; break;
        case 'google-assistant': pitch = 1.0; break;
        case 'gemini-vega': pitch = 1.30; rate = 1.02; break;
        case 'gemini-ursa': pitch = 0.90; rate = 0.92; break;
      }

      if (isCurrentlyMale) {
        pitch += 0.20;
      }

      utterance.pitch = pitch;
      utterance.rate = options?.rate !== undefined ? options.rate : rate;
      utterance.volume = options?.volume !== undefined ? options.volume : 1.0;

      utterance.onend = () => {
        this.updateVoiceState('idle');
        if (onEnd) onEnd();
      };

      utterance.onerror = (event: any) => {
        console.error("[MONI TTS] Sentezleme hatası:", event);
        this.updateVoiceState('idle');
        if (onError) onError(`Yerel ses hatası: ${event.error || 'Bilinmeyen Hata'}`);
        else if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e: any) {
      console.error("[MONI TTS] Yerel ses sentezleme başlatma hatası detaylı raporu:", {
        ttsSupported: isSupported,
        voicesCount: this.voices.length,
        error: e
      });
      const errMsg = `Yerel ses sentezleme başlatılamadı: ${e.message || e}`;
      if (onError) onError(errMsg);
      else if (onEnd) onEnd();
    }
  }
}
export const voiceService = VoiceService.getInstance();
