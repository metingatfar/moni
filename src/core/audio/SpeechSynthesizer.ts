import { getEndpoint } from '../../config/api';

export interface TTSOptions {
  rate?: number;
  volume?: number;
  voiceName?: string;
}

export type VoiceProfile = 'selin' | 'derin' | 'google-assistant' | 'gemini-vega' | 'gemini-ursa';

export class SpeechSynthesizer {
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
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

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    this.loadVoices();
    return this.voices;
  }

  public cancel(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const audio = (window as any).moniAudio as HTMLAudioElement | undefined;
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
    }
  }

  public async speak(
    text: string,
    profile: VoiceProfile,
    onEnd?: () => void,
    options?: TTSOptions,
    onError?: (errMessage: string) => void
  ): Promise<void> {
    const isIOS = typeof navigator !== 'undefined' &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    const isSafari = typeof navigator !== 'undefined' &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome/.test(navigator.userAgent);

    // ── 1. ElevenLabs TTS via /api/tts ──
    try {
      const audio = await this.openAiTts(text, options);
      audio.onended = () => {
        if (onEnd) onEnd();
      };
      audio.onerror = (errEvent: any) => {
        console.warn('[SpeechSynthesizer] ElevenLabs play failed, falling back to local synthesis.', errEvent);
        this.speakWithLocalSpeechSynthesis(text, profile, onEnd, options, onError);
      };
      await audio.play();
      return;
    } catch (e: any) {
      const isPaidPlanError = e.message && (e.message.includes('402') || e.message.includes('payment_required') || e.message.includes('paid_plan'));
      if (isPaidPlanError) {
        window.dispatchEvent(new CustomEvent('moni_info_notification', {
          detail: { message: 'Kota doldu, yerel ses motoru kullanılıyor.' }
        }));
      }
    }

    // ── 2. Google Cloud TTS ──
    const googleApiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY || '';
    if (googleApiKey.trim() && !isIOS && !isSafari) {
      try {
        let voiceName = 'tr-TR-Wavenet-C';
        let pitch = 0.0;
        let speakingRate = 1.0;

        switch (profile) {
          case 'selin': voiceName = 'tr-TR-Standard-A'; pitch = 1.0; break;
          case 'derin': voiceName = 'tr-TR-Wavenet-C'; pitch = 2.0; break;
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
            voice: { languageCode: 'tr-TR', name: voiceName, ssmlGender: 'FEMALE' },
            audioConfig: { audioEncoding: 'MP3', pitch, speakingRate: activeRate, volumeGainDb }
          })
        });

        if (!response.ok) throw new Error(`Google TTS status ${response.status}`);
        const data = await response.json();
        if (data.audioContent) {
          const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
          let audio = (window as any).moniAudio as HTMLAudioElement;
          if (!audio) {
            audio = new Audio();
            (window as any).moniAudio = audio;
          }
          audio.src = audioUrl;
          if (options?.volume !== undefined) audio.volume = options.volume;
          audio.onended = () => { if (onEnd) onEnd(); };
          audio.onerror = () => { this.speakWithLocalSpeechSynthesis(text, profile, onEnd, options, onError); };
          await audio.play();
          return;
        }
      } catch (e) {
        console.warn('[SpeechSynthesizer] Google TTS failed, falling back to local synthesis.', e);
      }
    }

    // ── 3. Web Speech API local fallback ──
    this.speakWithLocalSpeechSynthesis(text, profile, onEnd, options, onError);
  }

  private async openAiTts(text: string, options?: TTSOptions): Promise<HTMLAudioElement> {
    const url = getEndpoint('tts');
    console.log('[MONI TTS] Backend URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim().slice(0, 4000) })
    });

    if (!response.ok) {
      const err = await response.text().catch(() => '');
      throw new Error(`TTS failed ${response.status}: ${err}`);
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    let audio = (window as any).moniAudio as HTMLAudioElement;
    if (!audio) {
      audio = new Audio();
      (window as any).moniAudio = audio;
    }
    if (audio.src && audio.src.startsWith('blob:')) {
      URL.revokeObjectURL(audio.src);
    }
    audio.src = audioUrl;
    if (options?.volume !== undefined) audio.volume = options.volume;
    if (options?.rate !== undefined) audio.playbackRate = options.rate;
    return audio;
  }

  private speakWithLocalSpeechSynthesis(
    text: string,
    profile: VoiceProfile,
    onEnd?: () => void,
    options?: TTSOptions,
    onError?: (errMessage: string) => void
  ) {
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (!isSupported) {
      if (onError) onError('SpeechSynthesis not supported.');
      else if (onEnd) onEnd();
      return;
    }

    try {
      this.loadVoices();
      window.speechSynthesis.cancel();

      if (this.voices.length === 0) {
        const words = text.trim().split(/\s+/).length;
        setTimeout(() => { if (onEnd) onEnd(); }, Math.max(1500, words * 350));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';

      const isMaleVoice = (name: string) => /tolga|cem|hakan|sabri|huseyin|male|erkek|man\b|boy/i.test(name);
      const trVoices = this.voices.filter(v =>
        v.lang.toLowerCase().replace('_', '-').startsWith('tr') ||
        v.lang.toLowerCase().includes('tr')
      );

      const femaleTrVoices = trVoices.filter(v => {
        const name = v.name.toLowerCase();
        const hasFemaleMarker = /dilara|yelda|emel|seda|filiz|sibel|hazel|ayse|zeynep|yasemin|ipek|suna|female|bayan|woman|girl|siri|her/i.test(name);
        return (hasFemaleMarker || name.includes('google')) && !isMaleVoice(name);
      });

      const nonMaleTrVoices = trVoices.filter(v => !isMaleVoice(v.name));
      let selectedVoice: SpeechSynthesisVoice | null = null;

      if (femaleTrVoices.length > 0) {
        selectedVoice = femaleTrVoices[0];
      } else if (nonMaleTrVoices.length > 0) {
        selectedVoice = nonMaleTrVoices[0];
      } else if (trVoices.length > 0) {
        selectedVoice = trVoices[0];
      } else {
        selectedVoice = this.voices.find(v => v.default) || this.voices[0] || null;
      }

      if (options?.voiceName) {
        const customSelected = this.voices.find(v => v.name === options.voiceName);
        if (customSelected) selectedVoice = customSelected;
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        const words = text.trim().split(/\s+/).length;
        setTimeout(() => { if (onEnd) onEnd(); }, Math.max(1500, words * 350));
        return;
      }

      let pitch = 1.0;
      let rate = 1.0;

      switch (profile) {
        case 'selin': pitch = 1.05; rate = 1.0; break;
        case 'derin': pitch = 1.20; rate = 0.95; break;
        case 'google-assistant': pitch = 1.0; rate = 1.0; break;
        case 'gemini-vega': pitch = 1.30; rate = 1.02; break;
        case 'gemini-ursa': pitch = 0.90; rate = 0.92; break;
      }

      const isCurrentlyMale = selectedVoice ? isMaleVoice(selectedVoice.name) : false;
      if (isCurrentlyMale || (femaleTrVoices.length === 0 && trVoices.length > 0)) {
        pitch += 0.25;
      }

      utterance.pitch = pitch;
      utterance.rate = options?.rate !== undefined ? options.rate : rate;
      utterance.volume = options?.volume !== undefined ? options.volume : 1.0;

      utterance.onend = () => { if (onEnd) onEnd(); };
      utterance.onerror = (e) => {
        if (onError) onError(`SpeechSynthesis error: ${e.error}`);
        else if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e: any) {
      if (onError) onError(e.message || e);
      else if (onEnd) onEnd();
    }
  }
}
