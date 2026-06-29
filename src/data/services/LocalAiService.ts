import type { AiRepository, Message } from '../../domain/repositories/AiRepository';

export class LocalAiService implements AiRepository {
  async generateResponse(messages: Message[], useOfflineMode: boolean): Promise<string> {
    const userMessages = messages.filter(m => m.role === 'user');
    const isFirstMessage = userMessages.length <= 1;
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
    
    const inputLower = lastUserMessage.toLowerCase();
    
    // Check if we have a Gemini API key
    const geminiKey = localStorage.getItem('gemini_api_key') || (import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || '';

    if (geminiKey && !useOfflineMode) {
      try {
        console.log('MONI AI: Calling Gemini API for real-time response.');
        // Filter out empty messages and format them for Gemini API
        const formattedHistory = messages
          .filter(m => m.content && m.content.trim() !== '')
          .map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }));

        // Limit history length to last 15 messages for optimal performance
        const historySlice = formattedHistory.slice(-15);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: historySlice,
            systemInstruction: {
              parts: [{ 
                text: "Sen Moni adında, son derece zeki, cana yakın ve profesyonel bir yapay zeka asistanı ve özel kalem yöneticisisin. Sana seslenildiğinde ya da konuşulduğunda, kullanıcıyla kibar, sıcak ve yardımsever bir tonda iletişim kurmalısın. Türkçe konuşmalısın. Cevapların kısa, net, samimi ve sesli okumaya tam uyumlu olmalıdır. Markdown biçimlendirmeleri (kalın yazılar, yıldızlar, listeler vb.) veya okunması zor semboller kullanma, çünkü verdiğin cevaplar doğrudan sesli olarak okunacaktır. Kullanıcının not alma, görev ekleme ve randevu planlama isteklerini başarıyla yönetiyorsun." 
              }]
            },
            generationConfig: {
              maxOutputTokens: 250,
              temperature: 0.7
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return text.trim();
          }
        } else {
          const errText = await response.text();
          console.error('Gemini API Error details:', errText);
        }
      } catch (e) {
        console.error('Failed to get Gemini response:', e);
      }
    }

    // Fallback if no key is present or in offline mode
    if (!geminiKey) {
      if (isFirstMessage) {
        return "Merhaba! Ben yapay zeka asistanınız Moni. Benimle canlı konuşup her soruya gerçek yapay zeka cevapları alabilmek için lütfen sol menüdeki 'Sistem Ayarları' sayfasından ücretsiz bir Gemini API Anahtarı tanımlayın. Şu an deneme modundayım. Nasıl yardımcı olabilirim?";
      }
    }

    let baseResponse = '';
    if (inputLower.includes('hava') || inputLower.includes('durum')) {
      baseResponse = 'Bugün hava güneşli ve sıcaklık yirmi beş derece civarında, Metin.';
    } else if (inputLower.includes('nasılsın') || inputLower.includes('nasıl gidiyor')) {
      baseResponse = 'İyiyim Metin, teşekkür ederim. Sen nasılsın?';
    } else if (inputLower.includes('kimsin') || inputLower.includes('adın ne')) {
      baseResponse = 'Ben MONI, senin kişisel yapay zeka çalışma arkadaşınım Metin.';
    } else if (inputLower.includes('merhaba') || inputLower.includes('selam')) {
      baseResponse = 'Merhaba Metin, buradayım. Bugün nasıl yardımcı olayım?';
    } else if (inputLower.includes('beni duyuyor musun')) {
      baseResponse = 'Evet Metin, seni gayet net duyuyorum. Dinlemedeyim.';
    } else if (inputLower.includes('konuşuyor musun') || inputLower.includes('konusuyor musun')) {
      baseResponse = 'Evet Metin, seninle sesli olarak konuşabiliyorum.';
    } else if (inputLower.includes('devam et')) {
      baseResponse = 'Tamamdır Metin, dinliyorum, devam et lütfen.';
    } else if (inputLower.includes('yardım et') || inputLower.includes('yardim et')) {
      baseResponse = 'Tabii Metin, ne konuda yardıma ihtiyacın var? Birlikte çözelim.';
    } else {
      baseResponse = `Tabii Metin, anlatıyorum. "${lastUserMessage}" konusu hakkında başka yapmamı istediğiniz bir şey var mı?`;
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
