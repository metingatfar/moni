// Test Deepgram STT endpoint with proper multipart form data
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const audioPath = path.join(__dirname, '..', 'test_audio.wav');
const url = 'http://localhost:5000/api/stt/deepgram';

async function testDeepgramSTT() {
  console.log('=== DEEPGRAM STT BACKEND TEST ===\n');

  // 1. Check if audio file exists
  if (!fs.existsSync(audioPath)) {
    console.error('[FAIL] test_audio.wav bulunamadi');
    return;
  }
  console.log('[OK] test_audio.wav mevcut (' + fs.statSync(audioPath).size + ' bytes)');

  // 2. Build multipart form data manually
  const audioBuffer = fs.readFileSync(audioPath);
  const boundary = '----FormBoundary' + Date.now();
  
  const header = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="audio"; filename="record.wav"\r\n` +
    `Content-Type: audio/wav\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([header, audioBuffer, footer]);

  // 3. Send request
  console.log('[TEST] /api/stt/deepgram isteği gönderiliyor...');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });

    console.log('[RESULT] HTTP Status:', response.status);
    const responseText = await response.text();
    console.log('[RESULT] Response Body:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      if (data.transcript !== undefined) {
        console.log('\n[OK] Deepgram transcript döndü: "' + data.transcript + '"');
        if (data.transcript === '' || data.transcript.trim() === '') {
          console.log('[INFO] Transcript boş — sessiz WAV dosyası gönderildi, bu beklenen sonuç.');
          console.log('[OK] Deepgram API bağlantısı çalışıyor!');
        } else {
          console.log('[OK] Deepgram STT başarılı!');
        }
      }
    } else {
      console.log('[FAIL] Deepgram endpoint hata döndü:', response.status);
    }
  } catch (err) {
    console.error('[FAIL] İstek hatası:', err.message);
  }

  // 4. Test /api/chat/stream (Gemini)
  console.log('\n=== GEMINI CHAT STREAM TEST ===\n');
  try {
    const chatResponse = await fetch('http://localhost:5000/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Merhaba Moni, nasilsin?' })
    });

    console.log('[RESULT] HTTP Status:', chatResponse.status);
    
    if (chatResponse.ok) {
      const body = await chatResponse.text();
      // Parse SSE chunks
      const chunks = body.split('\n')
        .filter(line => line.startsWith('data: '))
        .map(line => {
          try { return JSON.parse(line.substring(6)).text; } catch { return ''; }
        })
        .join('');
      
      console.log('[OK] Gemini cevap verdi:', chunks.substring(0, 200));
    } else {
      const errBody = await chatResponse.text();
      console.log('[FAIL] Gemini hata:', errBody);
    }
  } catch (err) {
    console.error('[FAIL] Chat isteği hatası:', err.message);
  }

  console.log('\n=== TEST TAMAMLANDI ===');
}

testDeepgramSTT();
