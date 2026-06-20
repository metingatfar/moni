export interface SpeechVoice {
  name: string;
  gender: 'female' | 'male';
  pitch: number;
  rate: number;
}

export class VoiceService {
  private static instance: VoiceService;
  private voices: SpeechSynthesisVoice[] = [];

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
    systemInstruction?: string
  ): Promise<void> {
    try {
      const backendUrl = (import.meta.env && import.meta.env.VITE_BACKEND_API_URL) 
        ? import.meta.env.VITE_BACKEND_API_URL.replace(/\/api$/, '') 
        : 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, apiKey, history, systemInstruction }),
      });

      if (!response.body) throw new Error('ReadableStream desteklenmiyor.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

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
                onChunk(jsonData.text);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Canli akis esnasinda hata olustu:', error);
    }
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
    const base = (import.meta.env && import.meta.env.VITE_BACKEND_API_URL) || "http://localhost:5000/api";
    // Construct base URL ensuring no double '/api/api' segment
    const apiBase = base.endsWith("/api") ? base : `${base.replace(/\/$/, '')}/api`;
    const url = `${apiBase}/tts`;
    
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
   *   1. OpenAI TTS via /api/tts backend (best quality, consistent female voice)
   *   2. Google Cloud TTS (if VITE_GOOGLE_TTS_API_KEY is set, non-iOS/Safari)
   *   3. Browser Web Speech API (local fallback, quality varies by device)
   */
  public async speak(
    text: string,
    profile: 'selin' | 'derin' | 'google-assistant' | 'gemini-vega' | 'gemini-ursa',
    onEnd?: () => void,
    options?: { rate?: number; volume?: number; voiceName?: string },
    onError?: (errMessage: string) => void
  ) {
    const isIOS = typeof navigator !== 'undefined' &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    const isSafari = typeof navigator !== 'undefined' &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome/.test(navigator.userAgent);

    // ── 1. Try OpenAI TTS via backend ─────────────────────────────────────
    try {
      const audio = await this.openAiTts(text, options);

      audio.onended = () => {
        if (onEnd) onEnd();
      };
      audio.onerror = (errEvent: any) => {
        console.error('[MONI TTS] OpenAI ses oynatma hatası:', errEvent);
        console.warn('[MONI TTS] OpenAI başarısız → Google/Web Speech fallback devreye giriyor.');
        // Fallback to Web Speech API on playback error
        this.speakWithLocalSpeechSynthesis(text, profile, onEnd, options, onError);
      };

      await audio.play();
      console.log('[MONI TTS] OpenAI Nova kadın sesi aktif');
      return; // Success
    } catch (e: any) {
      console.warn('[MONI TTS] OpenAI TTS başarısız, Google Cloud TTS deneniyor:', e.message);
      console.warn('[MONI TTS] OpenAI başarısız → Google/Web Speech fallback devreye giriyor.');
    }

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

          audio.src = audioUrl;
          if (options?.volume !== undefined) audio.volume = options.volume;
          audio.onended = () => { if (onEnd) onEnd(); };
          audio.onerror = (errEvent: any) => {
            console.error('Google Cloud TTS ses oynatma hatası:', errEvent);
            if (onError) onError('Ses oynatılamadı.');
            else if (onEnd) onEnd();
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
    this.speakWithLocalSpeechSynthesis(text, profile, onEnd, options, onError);
  }

  /**
   * Browser SpeechSynthesis Fallback engine
   */
  private speakWithLocalSpeechSynthesis(
    text: string,
    profile: 'selin' | 'derin' | 'google-assistant' | 'gemini-vega' | 'gemini-ursa',
    onEnd?: () => void,
    options?: { rate?: number; volume?: number; voiceName?: string },
    onError?: (errMessage: string) => void
  ) {
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    console.log(`[MONI TTS] TTS destekleniyor mu: ${isSupported}`);

    if (!isSupported) {
      const err = "Tarayıcınız yerel ses sentezlemeyi (SpeechSynthesis) desteklemiyor.";
      console.warn(err);
      if (onError) onError(err);
      else if (onEnd) onEnd();
      return;
    }

    try {
      this.loadVoices(); // Refresh voices list
      console.log(`[MONI TTS] Toplam bulunan ses sayısı: ${this.voices.length}`);
      
      window.speechSynthesis.cancel();

      // Fallback 1: No voices found on system at all -> Silent text mode
      if (this.voices.length === 0) {
        console.warn("[MONI TTS] Cihazda sesli okuma motoru bulunamadı, sessiz metin modu aktif.");
        const words = text.trim().split(/\s+/).length;
        const estimatedDuration = Math.max(1500, words * 350);
        setTimeout(() => {
          if (onEnd) onEnd();
        }, estimatedDuration);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';

      // Helper: detect known male voice names
      const isMaleVoice = (name: string) =>
        /tolga|cem|hakan|sabri|huseyin|male|erkek|man\b|boy/i.test(name);

      // 1. Filter Turkish voices (supporting tr-TR, tr_TR, tr)
      const trVoices = this.voices.filter(v =>
        v.lang.toLowerCase().replace('_', '-').startsWith('tr') ||
        v.lang.toLowerCase().includes('tr')
      );

      // 2. Prioritize female voices:
      //    - Named female indicators (Yelda, Dilara, Seda, Siri Female, etc.)
      //    - "Google Türkçe" / "Google Turkish" → treat as female (it is)
      //    - Generic Turkish without a male marker → prefer over confirmed male
      const femaleTrVoices = trVoices.filter(v => {
        const name = v.name.toLowerCase();
        const hasFemaleMarker = /dilara|yelda|emel|seda|filiz|sibel|hazel|ayse|zeynep|yasemin|ipek|suna|female|bayan|woman|girl|siri|her/i.test(name);
        const isGoogleTurkish = name.includes('google');  // "Google Türkçe" is female
        return (hasFemaleMarker || isGoogleTurkish) && !isMaleVoice(name);
      });

      // Fallback: any Turkish voice that is not explicitly male
      const nonMaleTrVoices = trVoices.filter(v => !isMaleVoice(v.name));

      let selectedVoice: SpeechSynthesisVoice | null = null;

      // Rule-based voice selection hierarchy
      if (femaleTrVoices.length > 0) {
        selectedVoice = femaleTrVoices[0];
        console.log(`[MONI TTS] Türkçe kadın/Google sesi seçildi: ${selectedVoice.name} (${selectedVoice.lang})`);
      } else if (nonMaleTrVoices.length > 0) {
        selectedVoice = nonMaleTrVoices[0];
        console.log(`[MONI TTS] Türkçe kadın sesi bulunamadı, erkek olmayan Türkçe ses seçildi: ${selectedVoice.name}`);
      } else if (trVoices.length > 0) {
        selectedVoice = trVoices[0];
        console.log(`[MONI TTS] Yalnızca Türkçe erkek ses bulundu, kullanılıyor: ${selectedVoice.name}`);
      } else {
        selectedVoice = this.voices.find(v => v.default) || this.voices[0] || null;
        console.log(`[MONI TTS] Türkçe ses bulunamadı, sistem varsayılan sesi seçildi: ${selectedVoice ? selectedVoice.name : 'Yok'}`);
      }

      // 3. Apply custom voice name choice from settings if provided
      if (options?.voiceName) {
        const customSelected = this.voices.find(v => v.name === options.voiceName);
        if (customSelected) {
          selectedVoice = customSelected;
          console.log(`[MONI TTS] Kullanıcı ayarlarından seçilen yerel ses uygulandı: ${selectedVoice.name}`);
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        // Fallback 2: If we couldn't resolve any voice object, trigger silent fallback
        console.warn("[MONI TTS] Seçilen ses nesnesi alınamadı. Sessiz metin modu aktif ediliyor.");
        const words = text.trim().split(/\s+/).length;
        const estimatedDuration = Math.max(1500, words * 350);
        setTimeout(() => {
          if (onEnd) onEnd();
        }, estimatedDuration);
        return;
      }

      console.log(`[MONI TTS] Konuşma başlatılıyor. Seçilen Ses: ${selectedVoice.name} (${selectedVoice.lang})`);

      // Pitch adjustment based on profile and whether we are using a female voice
      let pitch = 1.0;
      let rate = 1.0;

      const hasFemaleTrVoice = femaleTrVoices.length > 0;
      const isCurrentlyMale = selectedVoice ? selectedVoice.name.toLowerCase().match(/(tolga|cem|male|hakan|erkek|sabri|huseyin)/i) : false;

      // Adjust profile values
      switch (profile) {
        case 'selin':
          pitch = 1.05;
          rate = 1.0;
          break;
        case 'derin':
          pitch = 1.20;
          rate = 0.95;
          break;
        case 'google-assistant':
          pitch = 1.0;
          rate = 1.0;
          break;
        case 'gemini-vega':
          pitch = 1.30;
          rate = 1.02;
          break;
        case 'gemini-ursa':
          pitch = 0.90;
          rate = 0.92;
          break;
      }

      // If the selected voice is male, but profile expects female, increase pitch slightly as a synthesis helper
      if (isCurrentlyMale || (!hasFemaleTrVoice && trVoices.length > 0)) {
        pitch += 0.25; // boost pitch to sound more feminine/natural
      }

      utterance.pitch = pitch;
      utterance.rate = options?.rate !== undefined ? options.rate : rate;
      utterance.volume = options?.volume !== undefined ? options.volume : 1.0;

      utterance.onend = () => {
        console.log("[MONI TTS] Yerel seslendirme başarıyla tamamlandı.");
        if (onEnd) onEnd();
      };

      utterance.onerror = (event: any) => {
        console.error("[MONI TTS] Yerel seslendirme hatası detaylı raporu:", {
          ttsSupported: isSupported,
          voicesCount: this.voices.length,
          selectedVoiceName: selectedVoice ? selectedVoice.name : 'Belirlenmedi',
          errorEvent: event
        });
        const errMsg = `Yerel ses sentezleme hatası: ${event.error || 'Bilinmeyen Hata'}`;
        if (onError) onError(errMsg);
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
