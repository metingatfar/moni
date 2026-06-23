import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getProvider, getAvailableProviders, getDefaultProvider } from './providers/index.js';

const app = express();
app.use(cors());
app.use(express.json());

// Static home test route removed to let express.static handle dist/index.html properly


import multer from 'multer';
const upload = multer();

// Sağlık kontrolü rotası
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        elevenLabsKey: !!process.env.ELEVENLABS_API_KEY,
        deepgramKey: !!process.env.DEEPGRAM_API_KEY,
        geminiKey: !!process.env.GEMINI_API_KEY,
        groqKey: !!process.env.GROQ_API_KEY
    });
});

// Kullanılabilir sağlayıcılar listesi
app.get('/api/providers', (req, res) => {
    res.json({
        available: getAvailableProviders(),
        default: getDefaultProvider()
    });
});

// Deepgram STT Endpoint — POST /api/stt/deepgram
app.post('/api/stt/deepgram', upload.single('audio'), async (req, res) => {
    try {
        const deepgramKey = process.env.DEEPGRAM_API_KEY;
        if (!deepgramKey) {
            console.error('[DG-STT-ERR] Deepgram API key missing on server');
            return res.status(503).json({ error: 'Deepgram API anahtarı sunucuda tanımlı değil.' });
        }

        if (!req.file || !req.file.buffer) {
            console.error('[DG-STT-ERR] No audio file uploaded');
            return res.status(400).json({ error: 'Ses dosyası yüklenemedi.' });
        }

        const model = process.env.DEEPGRAM_STT_MODEL || 'nova-3';
        const lang = process.env.DEEPGRAM_LANGUAGE || 'tr';

        const dgResponse = await fetch(`https://api.deepgram.com/v1/listen?model=${model}&language=${lang}&smart_format=true`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${deepgramKey}`,
                'Content-Type': 'audio/wav'
            },
            body: req.file.buffer
        });

        if (!dgResponse.ok) {
            const errBody = await dgResponse.text().catch(() => '');
            console.error('[DG-STT-ERR] Deepgram API error:', dgResponse.status, errBody);
            return res.status(dgResponse.status).json({ error: `Deepgram API Hatası: ${dgResponse.status}` });
        }

        const data = await dgResponse.json();
        const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
        console.log(`[DG-STT-3] Deepgram transcript: "${transcript}"`);

        res.json({ transcript });
    } catch (err) {
        console.error('[DG-STT-ERR] Server error:', err);
        res.status(500).json({ error: 'Ses işlenirken sunucuda bir hata oluştu.' });
    }
});

// Canlı Akış (Stream) Rotası - Mobil uygulaman buraya bağlanacak
app.post('/api/chat/stream', async (req, res) => {
    try {
        const { message, history, systemInstruction, apiKey, provider } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Mesaj bos olamaz." });
        }

        const defaultInstruction = "Sen Moni adında, son derece zeki, cana yakın ve profesyonel bir yapay zeka asistanı ve özel kalem yöneticisisin. Sana seslenildiğinde ya da konuşulduğunda, kullanıcıyla kibar, sıcak ve yardımsever bir tonda iletişim kurmalısın. Türkçe konuşmalısın. Cevapların kısa, net, samimi ve sesli okumaya tam uyumlu olmalıdır. Markdown biçimlendirmeleri (kalın yazılar, yıldızlar, listeler vb.) veya okunması zor semboller kullanma, çünkü verdiğin cevaplar doğrudan sesli olarak okunacaktır. Kullanıcının not alma, görev ekleme ve randevu planlama isteklerini başarıyla yönetiyorsun.";
        const activeInstruction = systemInstruction || defaultInstruction;

        let selectedProviderName = provider || getDefaultProvider();
        let providerInstance;

        try {
            providerInstance = getProvider(selectedProviderName);
        } catch (e) {
            selectedProviderName = getDefaultProvider();
            providerInstance = getProvider(selectedProviderName);
        }

        console.log(`[LLM-1] İstek başlatıldı. Sağlayıcı: ${selectedProviderName}`);

        try {
            await providerInstance.chatStream({
                message,
                history,
                systemInstruction: activeInstruction,
                apiKey,
                res
            });
        } catch (err) {
            console.warn(`[LLM-WARN] ${selectedProviderName} başarısız oldu, failover deneniyor... Hata:`, err.message);

            const otherProviderName = selectedProviderName === 'groq' ? 'gemini' : 'groq';
            try {
                const fallbackInstance = getProvider(otherProviderName);
                if (fallbackInstance.isAvailable()) {
                    console.log(`[LLM-2] Failover başlatıldı. Sağlayıcı: ${otherProviderName}`);
                    await fallbackInstance.chatStream({
                        message,
                        history,
                        systemInstruction: activeInstruction,
                        apiKey,
                        res
                    });
                } else {
                    throw new Error(`${otherProviderName} kullanılabilir değil.`);
                }
            } catch (fallbackErr) {
                console.error("[LLM-ERR] Her iki sağlayıcı da başarısız oldu:", fallbackErr.message);
                if (!res.headersSent) {
                    res.status(500).json({ error: `Yapay zeka yanıtı üretilemedi. Hata: ${fallbackErr.message}` });
                } else {
                    res.end();
                }
            }
        }
    } catch (error) {
        console.error("Akis esnasında genel hata olustu:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Sistemsel bir hata meydana geldi." });
        }
    }
});

// Tek seferlik tam tamamlama rotası (non-stream)
app.post('/api/chat/complete', async (req, res) => {
    try {
        const { message, systemInstruction, apiKey, provider } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Mesaj bos olamaz." });
        }

        let selectedProviderName = provider || getDefaultProvider();
        let providerInstance;

        try {
            providerInstance = getProvider(selectedProviderName);
        } catch (e) {
            selectedProviderName = getDefaultProvider();
            providerInstance = getProvider(selectedProviderName);
        }

        console.log(`[LLM-1] chatComplete başlatıldı. Sağlayıcı: ${selectedProviderName}`);

        try {
            const text = await providerInstance.chatComplete({
                message,
                systemInstruction,
                apiKey
            });
            res.json({ text });
        } catch (err) {
            console.warn(`[LLM-WARN] chatComplete ${selectedProviderName} başarısız oldu, failover deneniyor... Hata:`, err.message);

            const otherProviderName = selectedProviderName === 'groq' ? 'gemini' : 'groq';
            try {
                const fallbackInstance = getProvider(otherProviderName);
                if (fallbackInstance.isAvailable()) {
                    console.log(`[LLM-2] chatComplete failover başlatıldı. Sağlayıcı: ${otherProviderName}`);
                    const text = await fallbackInstance.chatComplete({
                        message,
                        systemInstruction,
                        apiKey
                    });
                    res.json({ text });
                } else {
                    throw new Error(`${otherProviderName} kullanılabilir değil.`);
                }
            } catch (fallbackErr) {
                console.error("[LLM-ERR] chatComplete her iki sağlayıcı da başarısız oldu:", fallbackErr.message);
                res.status(500).json({ error: `Yapay zeka yanıtı üretilemedi. Hata: ${fallbackErr.message}` });
            }
        }
    } catch (error) {
        console.error("chatComplete esnasında genel hata olustu:", error);
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
app.use('/api', (req, res) => {
    res.status(404).json({ error: "API endpoint bulunamadı" });
});

// Serve Vite frontend production build folder
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all frontend routes to Vite's index.html
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
    next();
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda basariyla baslatildi.`);
    console.log(`ElevenLabs TTS: ${process.env.ELEVENLABS_API_KEY ? '✅ Aktif' : '❌ Anahtar tanımlı değil — /api/tts çalışmaz'}`);
});