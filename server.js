import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);

// Static home test route removed to let express.static handle dist/index.html properly


// Sağlık kontrolü rotası
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        elevenLabsKey: !!process.env.ELEVENLABS_API_KEY
    });
});

// Canlı Akış (Stream) Rotası - Mobil uygulaman buraya bağlanacak
app.post('/api/chat/stream', async (req, res) => {
    try {
        const { message, history, systemInstruction, apiKey } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Mesaj bos olamaz." });
        }

        // Dinamik olarak gelen API anahtarını kullan veya çevresel değişkene düş
        const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        if (!activeKey) {
            // Eğer geçerli bir anahtar yoksa hata ver
            return res.status(400).json({ error: "Geçerli bir Gemini API anahtarı tanımlanmamış." });
        }

        const dynamicGenAI = new GoogleGenerativeAI(activeKey);

        const defaultInstruction = "Sen Moni adında, son derece zeki, cana yakın ve profesyonel bir yapay zeka asistanı ve özel kalem yöneticisisin. Sana seslenildiğinde ya da konuşulduğunda, kullanıcıyla kibar, sıcak ve yardımsever bir tonda iletişim kurmalısın. Türkçe konuşmalısın. Cevapların kısa, net, samimi ve sesli okumaya tam uyumlu olmalıdır. Markdown biçimlendirmeleri (kalın yazılar, yıldızlar, listeler vb.) veya okunması zor semboller kullanma, çünkü verdiğin cevaplar doğrudan sesli olarak okunacaktır. Kullanıcının not alma, görev ekleme ve randevu planlama isteklerini başarıyla yönetiyorsun.";
        
        const activeInstruction = systemInstruction || defaultInstruction;

        // Gemini 2.5 Flash modelini çağırıyoruz
        const model = dynamicGenAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: activeInstruction
        });

        // Sohbet geçmişini formatlıyoruz
        let contents = [];
        if (history && Array.isArray(history)) {
            contents = history
                .filter(m => m.content && m.content.trim() !== '' && m.role !== 'system')
                .map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }));
        }

        // Mevcut kullanıcı mesajını geçmişin sonuna ekliyoruz
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // En son 15 mesajı sınır olarak alıyoruz
        if (contents.length > 15) {
            contents = contents.slice(-15);
        }

        // Cevabın parça parça (Stream) akması için bağlantı ayarlarını yapıyoruz
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Gemini'den cevabı canlı akış olarak istiyoruz
        const result = await model.generateContentStream({ contents });

        // Gelen her bir kelime/harf parçasını anında mobil uygulamaya fırlatıyoruz
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }

        // Akış bittiğinde bağlantıyı güvenlice kapatıyoruz
        res.end();

    } catch (error) {
        console.error("Akis esnasında hata olustu:", error);
        res.status(500).json({ error: "Sistemsel bir hata meydana geldi." });
    }
});

// ============================================================
// ElevenLabs TTS Endpoint — POST /api/tts
// Supports manual ELEVENLABS_VOICE_ID or auto-selecting a premium female/natural voice.
// API key ONLY lives here on the server. Frontend never sees it.
// ============================================================
let cachedVoiceId = null;
let cachedVoiceName = '';

app.post('/api/tts', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({ error: 'text alanı boş olamaz.' });
        }

        const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
        if (!elevenLabsKey) {
            return res.status(503).json({ error: 'ElevenLabs API anahtarı sunucuda tanımlı değil.' });
        }

        // 1. Resolve Voice ID
        let voiceId = process.env.ELEVENLABS_VOICE_ID || cachedVoiceId;

        if (!voiceId) {
            console.log('[MONI TTS] ElevenLabs Voice ID bulunamadı, ses listesi sorgulanıyor...');
            try {
                const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
                    method: 'GET',
                    headers: { 'xi-api-key': elevenLabsKey }
                });

                if (voicesResponse.ok) {
                    const voicesData = await voicesResponse.json();
                    const voices = voicesData.voices || [];

                    // Filter voices: look for female or default high quality voices
                    let selectedVoice = voices.find(v => 
                        v.labels && 
                        v.labels.gender === 'female' && 
                        (v.labels.language === 'tr' || v.labels.accent === 'turkish')
                    );

                    // Fallback to general premium female voice
                    if (!selectedVoice) {
                        selectedVoice = voices.find(v => v.labels && v.labels.gender === 'female');
                    }

                    // Ultimate fallback to first available voice
                    if (!selectedVoice && voices.length > 0) {
                        selectedVoice = voices[0];
                    }

                    if (selectedVoice) {
                        voiceId = selectedVoice.voice_id;
                        cachedVoiceId = voiceId;
                        cachedVoiceName = selectedVoice.name;
                        console.log(`[MONI TTS] Seçilen ElevenLabs sesi: ${cachedVoiceName}`);
                    }
                } else {
                    console.warn(`[MONI TTS] Ses listesi alınamadı (${voicesResponse.status}). Varsayılan ses denenecek.`);
                }
            } catch (err) {
                console.error('[MONI TTS] Ses listesi sorgulama hatası:', err);
            }
        }

        // Default voice id fallback (Rachel voice id commonly available) if list fetching failed or yielded empty
        if (!voiceId) {
            voiceId = '21m00Tcm4TlvDq8ikWAM';
            console.log('[MONI TTS] Fallback Voice ID kullanılıyor: Rachel');
        }

        // Limit length to safe range
        const safeText = text.trim().slice(0, 4000);

        // Call ElevenLabs Text to Speech API
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'xi-api-key': elevenLabsKey,
                'Content-Type': 'application/json',
                'accept': 'audio/mpeg'
            },
            body: JSON.stringify({
                text: safeText,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!ttsResponse.ok) {
            const errBody = await ttsResponse.text().catch(() => '');
            console.error('[MONI TTS] ElevenLabs API hatası:', ttsResponse.status, errBody);
            return res.status(ttsResponse.status).json({
                error: `ElevenLabs TTS hatası: ${ttsResponse.status}`
            });
        }

        // Return MP3 binary stream
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-store');

        const { Readable } = await import('stream');
        const nodeStream = Readable.fromWeb(ttsResponse.body);
        nodeStream.pipe(res);

        nodeStream.on('error', (err) => {
            console.error('[MONI TTS] Stream aktarım hatası:', err);
            if (!res.headersSent) res.status(500).end();
        });

    } catch (error) {
        console.error('[MONI TTS] Sunucu hatası:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'TTS işlenirken bir hata oluştu.' });
        }
    }
});

const PORT = process.env.PORT || 5000;

// Serve frontend static assets from dist folder and handle SPA routing
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicit API route catcher to prevent SPA fallback from overriding missing API calls
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: "API endpoint bulunamadı" });
});

// Serve Vite frontend production build folder
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all frontend routes to Vite's index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda basariyla baslatildi.`);
    console.log(`ElevenLabs TTS: ${process.env.ELEVENLABS_API_KEY ? '✅ Aktif' : '❌ Anahtar tanımlı değil — /api/tts çalışmaz'}`);
});