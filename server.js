import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);

// Ana sayfa test rotası
app.get('/', (req, res) => {
    res.send('Moni Antigravity Sunucusu Aktif!');
});

// Sağlık kontrolü rotası
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        openaiKey: !!process.env.OPENAI_API_KEY
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
// OpenAI TTS Endpoint — POST /api/tts
// API key ONLY lives here on the server. Frontend never sees it.
// ============================================================
app.post('/api/tts', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({ error: 'text alanı boş olamaz.' });
        }

        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
            return res.status(503).json({ error: 'OpenAI API anahtarı sunucuda tanımlı değil.' });
        }

        // Metin çok uzunsa ilk 4096 karakterle sınırla (OpenAI TTS limiti)
        const safeText = text.trim().slice(0, 4096);

        const openaiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini-tts',
                voice: 'nova',
                input: safeText,
                response_format: 'mp3'
            })
        });

        if (!openaiResponse.ok) {
            const errBody = await openaiResponse.text();
            console.error('[MONI TTS] OpenAI hatası:', openaiResponse.status, errBody);
            return res.status(openaiResponse.status).json({
                error: `OpenAI TTS hatası: ${openaiResponse.status}`
            });
        }

        // MP3 binary veriyi doğrudan istemciye aktar
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-store');

        // Node 18+ — Response.body bir ReadableStream, pipe ile aktarabiliriz
        const { Readable } = await import('stream');
        const nodeStream = Readable.fromWeb(openaiResponse.body);
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
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda basariyla baslatildi.`);
    console.log(`OpenAI TTS: ${process.env.OPENAI_API_KEY ? '✅ Aktif' : '❌ Anahtar tanımlı değil — /api/tts çalışmaz'}`);
});