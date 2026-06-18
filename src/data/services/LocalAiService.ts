import type { AiRepository, Message } from '../../domain/repositories/AiRepository';

export class LocalAiService implements AiRepository {
  async generateResponse(messages: Message[], useOfflineMode: boolean): Promise<string> {
    const userMessages = messages.filter(m => m.role === 'user');
    const isFirstMessage = userMessages.length <= 1;
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
    
    const inputLower = lastUserMessage.toLowerCase();
    let baseResponse = '';
    
    if (inputLower.includes('hava') || inputLower.includes('durum')) {
      baseResponse = 'Bugün hava güneşli ve sıcaklık yirmi beş derece civarında.';
    } else if (inputLower.includes('nasılsın') || inputLower.includes('nasıl gidiyor')) {
      baseResponse = 'Çok iyiyim, teşekkürler. Size hizmet etmek için hazırım.';
    } else if (inputLower.includes('kimsin') || inputLower.includes('adın ne')) {
      baseResponse = 'Ben sizin için özelleştirilmiş akıllı asistan ve özel kalem sistemi MONIyim.';
    } else {
      baseResponse = `Talebinizle ilgileniyorum. "${lastUserMessage}" konusu hakkında başka yapmamı istediğiniz bir şey var mı?`;
    }

    if (useOfflineMode) {
      console.log('MONI AI: Running in [OFFLINE / Local Gemma 2B] mode.');
      return isFirstMessage 
        ? `Merhaba, ben asistanınız Moni. İnternet bağlantımız olmasa da yerel olarak hizmetinizdeyim. ${baseResponse}`
        : baseResponse;
    }

    console.log('MONI AI: Running in [ONLINE / GPT-4 / Claude API] mode.');
    return isFirstMessage 
      ? `Merhaba, ben asistanınız Moni. Nasıl yardımcı olabilirim? ${baseResponse}`
      : baseResponse;
  }

  async speechToText(audioBlob: Blob): Promise<string> {
    console.log('MONI SpeechToText: Processing audio blob of size', audioBlob.size);
    // Real implementation would pass to local Whisper WASM or WebSpeech API
    return "Moni, Ahmet'i ara.";
  }

  async textToSpeech(text: string): Promise<AudioBuffer | ArrayBuffer> {
    console.log('MONI TextToSpeech: Synthesizing speech for:', text);
    
    // Web Speech API wrapper for browser TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      window.speechSynthesis.speak(utterance);
    }
    
    return new ArrayBuffer(0);
  }
}
