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
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
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
      this.voices = window.speechSynthesis.getVoices().filter(v => 
        v.lang.startsWith('tr') || v.lang.startsWith('tr-TR')
      );
    }
  }

  public getAvailableTrVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public async speak(text: string, profile: 'selin' | 'derin' | 'google-assistant' | 'gemini-vega' | 'gemini-ursa' | 'can' | 'murat', onEnd?: () => void) {
    const apiKey = import.meta.env.***REMOVED*** || '';

    if (apiKey.trim()) {
      try {
        let voiceName = 'tr-TR-Wavenet-C'; // Default female Wavenet
        let gender = 'FEMALE';
        let pitch = 0.0;
        let speakingRate = 1.0;

        switch (profile) {
          case 'selin':
            voiceName = 'tr-TR-Standard-A';
            pitch = 1.0;
            break;
          case 'derin':
            voiceName = 'tr-TR-Wavenet-C';
            pitch = 2.0;
            break;
          case 'google-assistant':
            voiceName = 'tr-TR-Wavenet-C'; // Google Assistant official high quality
            pitch = 0.0;
            break;
          case 'gemini-vega':
            voiceName = 'tr-TR-Wavenet-C';
            pitch = 4.0; // Higher pitch
            speakingRate = 1.05;
            break;
          case 'gemini-ursa':
            voiceName = 'tr-TR-Wavenet-C';
            pitch = -2.0; // Warmer pitch
            speakingRate = 0.93;
            break;
          case 'can':
            voiceName = 'tr-TR-Wavenet-B'; // Male Wavenet
            gender = 'MALE';
            pitch = 0.0;
            break;
          case 'murat':
            voiceName = 'tr-TR-Wavenet-E'; // Deep Male
            gender = 'MALE';
            pitch = -3.0;
            break;
        }

        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: 'tr-TR', name: voiceName, ssmlGender: gender },
            audioConfig: { audioEncoding: 'MP3', pitch, speakingRate }
          })
        });

        if (!response.ok) {
          throw new Error(`Cloud TTS Error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.audioContent) {
          const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
          
          let audio = (window as any).moniAudio;
          if (!audio) {
            audio = new Audio();
            (window as any).moniAudio = audio;
          }
          
          audio.src = audioUrl;
          audio.onended = () => {
            if (onEnd) onEnd();
          };
          audio.onerror = () => {
            if (onEnd) onEnd();
          };
          
          await audio.play();
          return; // Success, exit speak method
        }
      } catch (e) {
        console.error("Cloud TTS failed, falling back to Google Translate TTS:", e);
      }
    }

    // Fall back to Google Translate TTS which will automatically fall back to SpeechSynthesis on failure
    await this.playGoogleTranslateTts(text, profile, onEnd);
  }

  private splitTextIntoChunks(text: string, maxLength: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const word of words) {
      if ((currentChunk + ' ' + word).trim().length > maxLength) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = word;
      } else {
        currentChunk = (currentChunk + ' ' + word).trim();
      }
    }
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    return chunks;
  }

  private async playGoogleTranslateTts(text: string, profile: 'selin' | 'derin' | 'google-assistant' | 'gemini-vega' | 'gemini-ursa' | 'can' | 'murat', onEnd?: () => void) {
    if (typeof window === 'undefined') {
      if (onEnd) onEnd();
      return;
    }

    const chunks = this.splitTextIntoChunks(text, 180);
    let audio = (window as any).moniAudio;
    if (!audio) {
      audio = new Audio();
      (window as any).moniAudio = audio;
    }

    let currentChunkIndex = 0;

    const playNext = () => {
      if (currentChunkIndex >= chunks.length) {
        audio.onended = null;
        audio.onerror = null;
        if (onEnd) onEnd();
        return;
      }

      const chunk = chunks[currentChunkIndex];
      currentChunkIndex++;

      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=tr&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      audio.src = url;
      
      audio.play().catch(err => {
        console.error("Google Translate TTS play error, falling back to local SpeechSynthesis:", err);
        this.speakWithLocalSpeechSynthesis(chunk, profile, () => {
          playNext();
        });
      });
    };

    audio.onended = () => {
      playNext();
    };

    audio.onerror = (e) => {
      console.warn("Google Translate TTS error, attempting local SpeechSynthesis:", e);
      const currentChunk = chunks[currentChunkIndex - 1] || text;
      this.speakWithLocalSpeechSynthesis(currentChunk, profile, () => {
        playNext();
      });
    };

    playNext();
  }

  private speakWithLocalSpeechSynthesis(text: string, profile: 'selin' | 'derin' | 'google-assistant' | 'gemini-vega' | 'gemini-ursa' | 'can' | 'murat', onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';

    const femaleSystemVoices = this.voices.filter(v => 
      v.name.toLowerCase().match(/(dilara|yelda|female|google|seda|filiz|sibel)/)
    );
    const maleSystemVoices = this.voices.filter(v => 
      v.name.toLowerCase().match(/(tolga|cem|male|can|hakan|erhan)/)
    );
    const defaultVoice = this.voices[0] || null;

    let targetVoice: SpeechSynthesisVoice | null = null;
    let pitch = 1.0;
    let rate = 1.0;

    switch (profile) {
      case 'selin':
        targetVoice = this.voices.find(v => v.name.toLowerCase().includes('dilara')) || femaleSystemVoices[0] || defaultVoice;
        pitch = 1.05;
        rate = 1.0;
        break;
      case 'derin':
        targetVoice = femaleSystemVoices.find(v => v.name.toLowerCase().includes('google')) || femaleSystemVoices[1] || femaleSystemVoices[0] || defaultVoice;
        pitch = 1.25;
        rate = 0.95;
        break;
      case 'google-assistant':
        targetVoice = femaleSystemVoices.find(v => v.name.toLowerCase().includes('google')) || femaleSystemVoices[0] || defaultVoice;
        pitch = 1.0;
        rate = 1.02;
        break;
      case 'gemini-vega':
        targetVoice = femaleSystemVoices.find(v => v.name.toLowerCase().includes('google')) || femaleSystemVoices[0] || defaultVoice;
        pitch = 1.35;
        rate = 0.98;
        break;
      case 'gemini-ursa':
        targetVoice = femaleSystemVoices.find(v => v.name.toLowerCase().includes('google')) || femaleSystemVoices[0] || defaultVoice;
        pitch = 0.92;
        rate = 0.90;
        break;
      case 'can':
        targetVoice = maleSystemVoices[0] || defaultVoice;
        pitch = 1.05;
        rate = 1.05;
        break;
      case 'murat':
        targetVoice = maleSystemVoices[1] || maleSystemVoices[0] || defaultVoice;
        pitch = 0.8;
        rate = 0.9;
        break;
    }

    const hasFemaleSystemVoice = femaleSystemVoices.length > 0;
    const hasMaleSystemVoice = maleSystemVoices.length > 0;

    if (targetVoice) {
      const nameLower = targetVoice.name.toLowerCase();
      const isActuallyMale = nameLower.match(/(tolga|cem|male|hakan)/);
      const isActuallyFemale = nameLower.match(/(dilara|yelda|female|google|seda)/);

      if ((profile === 'selin' || profile === 'derin' || profile === 'google-assistant' || profile === 'gemini-vega' || profile === 'gemini-ursa') && (!hasFemaleSystemVoice || isActuallyMale)) {
        if (profile === 'selin') pitch = 1.55;
        else if (profile === 'derin') pitch = 1.75;
        else if (profile === 'google-assistant') pitch = 1.5;
        else if (profile === 'gemini-vega') pitch = 1.85;
        else if (profile === 'gemini-ursa') pitch = 1.30;
      }

      if ((profile === 'can' || profile === 'murat') && (!hasMaleSystemVoice || isActuallyFemale)) {
        pitch = profile === 'can' ? 0.65 : 0.52;
      }

      utterance.voice = targetVoice;
    }

    utterance.pitch = pitch;
    utterance.rate = rate;

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  }
}
export const voiceService = VoiceService.getInstance();
