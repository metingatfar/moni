import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getProvider, getAvailableProviders, getDefaultProvider } from './providers/index.js';

let groqRateLimitedUntil = 0; // Timestamp in ms

function getLocalFallbackResponse(message, isEnglish) {
    const text = message.toLowerCase().trim();
    
    // Greetings check
    const trGreetings = ['merhaba', 'selam', 'hey', 'günaydın', 'tünaydın', 'iyi günler'];
    const enGreetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const isTrGreet = trGreetings.some(g => text === g || text.startsWith(g + ' ') || text.endsWith(' ' + g));
    const isEnGreet = enGreetings.some(g => text === g || text.startsWith(g + ' ') || text.endsWith(' ' + g));
    
    if (isTrGreet || isEnGreet) {
        return isEnglish
            ? "Hello! How can I assist you today? I am MONI, your personal AI workspace companion."
            : "Merhaba! Size nasıl yardımcı olabilirim? Ben MONI, kişisel yapay zeka çalışma arkadaşınızım.";
    }

    // Identity / Creator questions
    if (text.includes('sen kimsin') || text.includes('kendini tanıt') || text.includes('who are you') || text.includes('introduce yourself') || text.includes('moni kimdir') || text.includes('who is moni')) {
        return isEnglish
            ? "Hello, I am MONI AI Operating System, your personal AI workspace companion. I can chat, remember context, assist with projects, manage workflows, generate reports, and help you work more efficiently."
            : "Merhaba, ben MONI AI Operating System. Metin GATFAR tarafından tasarlanmış kişisel yapay zeka çalışma arkadaşınım. Sohbet edebilir, sesli komutları anlayabilir, hafıza tutabilir, projelerini yönetebilir, rapor hazırlayabilir, workflow süreçlerini takip edebilir ve çalışma alanında sana yardımcı olabilirim.";
    }

    if (text.includes('kim geliştirdi') || text.includes('who developed') || text.includes('yaratıcın kim') || text.includes('metin gatfar') || text.includes('gatfar')) {
        return isEnglish
            ? "I was created and developed by Metin GATFAR in 2026 as a premium proactive AI Operating System."
            : "Ben, Metin GATFAR tarafından 2026 yılında üst düzey proaktif bir Yapay Zeka İşletim Sistemi olarak geliştirildim.";
    }

    if (text.includes('moni nedir') || text.includes('what is moni')) {
        return isEnglish
            ? "MONI is a Modern Orchestrated Networked Intelligence framework designed to operate as a local-first AI workspace and companion system."
            : "MONI, yerel öncelikli bir yapay zeka çalışma alanı ve companion sistemi olarak çalışmak üzere tasarlanmış modern bir dijital asistan altyapısıdır.";
    }

    // Features
    if (text.includes('özelliklerin neler') || text.includes('ne yapabilirsin') || text.includes('what can you do') || text.includes('what are your features') || text.includes('moni ne yapabilir')) {
        return isEnglish
            ? "I can manage tasks, modulate voice outputs, log activity timelines, keep memories, coordinate workflows, and generate markdown reports."
            : "Görevlerinizi yönetebilir, ses modülasyonu yapabilir, aktivite geçmişi tutabilir, hafıza oluşturabilir, iş akışlarını koordine edebilir ve Markdown raporları üretebilirim.";
    }

    // Memory
    if (text.includes('hafıza nasıl çalışır') || text.includes('how does memory work')) {
        return isEnglish
            ? "I capture facts about you during chat (like your name or project) and save them in categories inside a local SQLite database."
            : "Sohbet esnasında hakkınızda edindiğim bilgileri (isminiz veya projeniz gibi) yerel bir SQLite veritabanındaki kategorilerde saklarım.";
    }

    // Voice / STT / TTS
    if (text.includes('sesli komut nasıl') || text.includes('how do voice commands work')) {
        return isEnglish
            ? "I record your voice from the microphone, transcribe it using Deepgram, and execute the command locally."
            : "Mikrofonunuzdan aldığım sesi kaydeder, Deepgram ile metne dönüştürür ve ilgili komutu yerel olarak çalıştırırım.";
    }

    if (text.includes('wake word') || text.includes('uyandırma kelimesi')) {
        return isEnglish
            ? "The wake word is 'Moni'. When spoken, the assistant automatically triggers microphone listening."
            : "Uyandırma kelimesi 'Moni'dir. Bu kelime söylendiğinde asistan mikrofon dinlemesini otomatik olarak başlatır.";
    }

    // Workspace & Workflow
    if (text.includes('workspace nedir') || text.includes('what is workspace')) {
        return isEnglish
            ? "Workspace is the main project directory folder where all your notes, databases, and project documents are located."
            : "Workspace, tüm notlarınızın, veritabanınızın ve proje dökümanlarınızın yer aldığı ana çalışma klasörüdür.";
    }

    if (text.includes('workflow nedir') || text.includes('what is workflow')) {
        return isEnglish
            ? "Workflows are automated pipelines triggered by events (like database updates or cron jobs) to carry out custom tasks."
            : "Workflow, belirli sistem olayları veya zamanlayıcılar tetiklendiğinde çalışan otomatik iş akışları ve görev zincirleridir.";
    }

    // Intelligence / Companion Mode
    if (text.includes('intelligence layer') || text.includes('zeka katmanı')) {
        return isEnglish
            ? "The Intelligence Layer is a background engine that monitors user activity quietly and delivers proactive help suggestions."
            : "Intelligence Layer, kullanıcı aktivitelerini izleyen ve gerektiğinde sakin, proaktif yardım önerileri sunan arka plan motorudur.";
    }

    if (text.includes('companion mode') || text.includes('refakatçi') || text.includes('companion nedir')) {
        return isEnglish
            ? "Companion Mode shows your daily summaries, smart notifications, and the live status of your system variables."
            : "Companion Modu; günlük özetlerinizi, akıllı bildirimleri ve sistem değişkenlerinizin durumlarını size sunan refakatçi modudur.";
    }

    // Reports / Plugins / Security
    if (text.includes('rapor sistemi') || text.includes('what is the report system') || text.includes('reports system')) {
        return isEnglish
            ? "I can automatically generate comprehensive reports inside the 'reports' folder covering development audits or metrics."
            : "Geliştirme denetimlerini veya sistem metriklerini içeren kapsamlı raporları 'reports' klasörünüzde otomatik olarak üretebilirim.";
    }

    if (text.includes('plugin marketplace') || text.includes('eklenti marketi')) {
        return isEnglish
            ? "It is an upcoming section designed to allow users to load modular AI providers, custom widgets, or tools."
            : "Kullanıcıların modüler yapay zeka sağlayıcıları, özel araçlar veya bileşenler yüklemesine olanak tanıyan eklenti marketidir.";
    }

    if (text.includes('güvenlik sistemi') || text.includes('security system')) {
        return isEnglish
            ? "MONI keeps all database entries local and secures API credentials inside browser localStorage or server configuration files."
            : "MONI, tüm veritabanı kayıtlarını yerelde tutar ve API kimlik bilgilerini tarayıcı yerel depolamasında veya sunucu ayarlarında saklar.";
    }

    // Settings & Localization
    if (text.includes('dil sistemi') || text.includes('language system')) {
        return isEnglish
            ? "You can toggle between Turkish (TR) and English (EN) in the settings menu, which re-translates all interface elements."
            : "Ayarlar menüsünden Türkçe (TR) ve İngilizce (EN) dilleri arasında geçiş yapabilirsiniz; bu tüm arayüzü yeniden tercüme eder.";
    }

    // Fallbacks
    if (text.includes('local fallback') || text.includes('yerel yedekleme')) {
        return isEnglish
            ? "Local fallback is MONI's capability to answer basic FAQ, identity, and system questions offline without any cloud APIs."
            : "Local fallback, MONI'nin hiçbir bulut API'sine ihtiyaç duymadan temel soruları, kimlik ve sistem bilgilerini çevrimdışı cevaplama yeteneğidir.";
    }

    if (text.includes('provider fallback') || text.includes('sağlayıcı yedekleme')) {
        return isEnglish
            ? "If a provider experiences a rate limit (429) or error, the waterfall system redirects the query to Gemini or OpenAI."
            : "Bir sağlayıcı limit aşımı (429) veya hata verdiğinde, sistem isteği otomatik olarak Gemini veya OpenAI'ye aktarır.";
    }

    // Comparison
    if (text.includes('farkları nedir') || text.includes('differences') || text.includes('gemini / openai / groq')) {
        return isEnglish
            ? "Gemini offers multimodality, OpenAI provides smart reasoning, while Groq operates with extreme speed fallback."
            : "Gemini gelişmiş multimodalite sunar, OpenAI akıllı muhakeme sağlar, Groq ise ultra yüksek hızlı yedek motor olarak çalışır.";
    }

    // Limits, offline, authentications, git updates
    if (text.includes('internet yokken') || text.includes('without internet') || text.includes('internet bağlantısı')) {
        return isEnglish
            ? "Without internet, you can still manage your local tasks, read notes, search memories, and query help topics locally."
            : "İnternet bağlantınız olmasa bile yerel görevlerinizi yönetebilir, notlarınızı okuyabilir, hafızanızı arayabilir ve yardım konularını sorgulayabilirsiniz.";
    }

    if (text.includes('api limiti') || text.includes('rate limit') || text.includes('limiti dolarsa')) {
        return isEnglish
            ? "If API limits are reached, MONI activates provider waterfall fallbacks or uses the guaranteed offline local knowledge base."
            : "API kotaları dolduğunda MONI diğer yedek sağlayıcılara geçiş yapar ya da garantili yerel zeka cevap motorunu kullanır.";
    }

    if (text.includes('şifreli giriş') || text.includes('authentication') || text.includes('login plan')) {
        return isEnglish
            ? "The authentication plan covers secure local passwords (bcrypt/argon2), JWT session cookies, and route guards."
            : "Kimlik doğrulama planı; güvenli yerel şifreleri (bcrypt/argon2), JWT oturum çerezlerini ve router korumalarını kapsar.";
    }

    if (text.includes('github güncellemesi') || text.includes('github update') || text.includes('github sync')) {
        return isEnglish
            ? "The Git update safely publishes compiled codebases to remote repositories after verifying .gitignore patterns."
            : "Git güncellemesi, derlenen kodları .gitignore kurallarını doğruladıktan sonra uzak depoya güvenle push eder.";
    }

    if (text.includes('mobilde nasıl') || text.includes('how does moni work on mobile') || text.includes('mobile')) {
        return isEnglish
            ? "Through Capacitor, MONI packages are compiled into native mobile apps showing simplified full-screen orb layouts."
            : "Capacitor sayesinde MONI kodları yerel mobil paketlere derlenerek sadeleştirilmiş tam ekran küre arayüzü sunar.";
    }

    if (text.includes('help') || text.includes('yardım')) {
        return isEnglish
            ? "You can view the system dashboard, inspect custom memories, open help FAQ pages, or configure proactive settings."
            : "Komut paletini açmak için Ctrl+K tuşlarına basabilir, yardım sekmelerini inceleyebilir ya da ayarlardan proaktif önerileri kişiselleştirebilirsiniz.";
    }

    return null;
}


function trimHistoryAndPayload(history, message) {
    if (!history || !Array.isArray(history)) return history;
    const historyText = history.map(m => m.content || '').join(' ');
    const totalLength = message.length + historyText.length;
    if (totalLength > 6000) {
        console.log(`[TOKEN-TRIM] Payload too large (${totalLength} chars). Trimming history.`);
        return history.slice(-5);
    }
    return history;
}

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

        const defaultInstruction = "Sen Moni adında, son derece zeki, cana yakın ve profesyonel bir yapay zeka asistanı ve özel kalem yöneticisisin. Türkçe konuşmalısın. Cevapların kısa, net, samimi ve sesli okumaya tam uyumlu olmalıdır.";
        const activeInstruction = systemInstruction || defaultInstruction;
        const isEnglish = activeInstruction.includes('en-US') || activeInstruction.toLowerCase().includes('english');

        // A. Check Guaranteed Local Fallback
        const localResponse = getLocalFallbackResponse(message, isEnglish);
        if (localResponse) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.write("data: " + JSON.stringify({ text: localResponse, providerStatus: 'Local Fallback', isRateLimited: false }) + "\n\n");
            res.end();
            return;
        }

        // B. Handle Local Fallback Setting
        if (provider === 'local') {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            const localDefault = isEnglish
                ? "Hello, I am MONI. The cloud AI provider is currently offline, but you can continue using local workspace tools."
                : "Merhaba, ben MONI. Şu anda yapay zeka sağlayıcısına bağlanılamıyor, ancak çalışma alanı ve diğer yerel araçlarınızı kullanmaya devam edebilirsiniz.";
            res.write("data: " + JSON.stringify({ text: localDefault, providerStatus: 'Local Fallback Only', isRateLimited: false }) + "\n\n");
            res.end();
            return;
        }

        // C. Build Fallback Priority List
        const providersToTry = [];
        if (provider && provider !== 'auto' && provider !== 'local') {
            providersToTry.push(provider);
        }

        // Waterfall Priority: Gemini -> OpenAI -> Groq
        if (!providersToTry.includes('gemini')) providersToTry.push('gemini');
        if (!providersToTry.includes('openai')) providersToTry.push('openai');
        if (!providersToTry.includes('groq')) providersToTry.push('groq');

        const activeHistory = trimHistoryAndPayload(history, message);
        let success = false;
        let lastError = null;

        for (const provName of providersToTry) {
            try {
                // Circuit Breaker: Skip groq if rate-limited cooldown active
                if (provName === 'groq' && Date.now() < groqRateLimitedUntil) {
                    console.log('[CIRCUIT-BREAKER] Groq is in rate-limit cooldown. Skipping.');
                    continue;
                }

                const instance = getProvider(provName);
                if (!instance.isAvailable()) continue;

                // If preceding provider was rate-limited, warn in header/stream cleanly without breaking response
                if (lastError && (lastError.message.includes('429') || lastError.message.toLowerCase().includes('rate_limit') || lastError.message.toLowerCase().includes('quota'))) {
                    if (!res.headersSent) {
                        res.setHeader('Content-Type', 'text/event-stream');
                        res.setHeader('Cache-Control', 'no-cache');
                        res.setHeader('Connection', 'keep-alive');
                    }
                    const warningMsg = isEnglish
                        ? "Groq rate limit reached. Switching to Gemini.\n\n"
                        : "Groq geçici olarak limitte. Gemini kullanılıyor.\n\n";
                    res.write("data: " + JSON.stringify({ text: warningMsg, providerStatus: 'Fallback Provider', isRateLimited: true }) + "\n\n");
                }

                await instance.chatStream({
                    message,
                    history: activeHistory,
                    systemInstruction: activeInstruction,
                    apiKey,
                    res
                });
                success = true;
                break;
            } catch (err) {
                console.warn(`[PROVIDER-FALLBACK] ${provName} failed:`, err.message);
                lastError = err;

                // Trigger Circuit Breaker for Groq 429
                if (provName === 'groq' && (err.message.includes('429') || err.message.toLowerCase().includes('rate_limit') || err.message.toLowerCase().includes('quota'))) {
                    console.log('[CIRCUIT-BREAKER] Groq 429 detected. Activating cooldown for 60 seconds.');
                    groqRateLimitedUntil = Date.now() + 60 * 1000;
                }
            }
        }

        // D. Ultimate Fallback to Local Engine on complete failure
        if (!success) {
            if (!res.headersSent) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
            }

            const ultimateLocal = isEnglish
                ? "Hello, I am MONI. All cloud AI providers are currently busy. You can continue using offline features."
                : "Merhaba, ben MONI. Yapay zeka sağlayıcıları şu anda yoğun. Yerel araçlar üzerinden çalışmanıza devam edebilirsiniz.";

            res.write("data: " + JSON.stringify({ text: ultimateLocal, providerStatus: 'Rate Limited Local Fallback', isRateLimited: true }) + "\n\n");
            res.end();
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

        const activeInstruction = systemInstruction || "";
        const isEnglish = activeInstruction.includes('en-US') || activeInstruction.toLowerCase().includes('english');

        // A. Check Guaranteed Local Fallback
        const localResponse = getLocalFallbackResponse(message, isEnglish);
        if (localResponse) {
            return res.json({ text: localResponse, providerStatus: 'Local Fallback', isRateLimited: false });
        }

        // B. Handle Local Fallback Setting
        if (provider === 'local') {
            const localDefault = isEnglish
                ? "Hello, I am MONI. The cloud AI provider is currently offline."
                : "Merhaba, ben MONI. Şu anda yapay zeka sağlayıcısına bağlanılamıyor.";
            return res.json({ text: localDefault, providerStatus: 'Local Fallback Only', isRateLimited: false });
        }

        // C. Build Fallback Priority List
        const providersToTry = [];
        if (provider && provider !== 'auto' && provider !== 'local') {
            providersToTry.push(provider);
        }

        if (!providersToTry.includes('gemini')) providersToTry.push('gemini');
        if (!providersToTry.includes('openai')) providersToTry.push('openai');
        if (!providersToTry.includes('groq')) providersToTry.push('groq');

        let success = false;
        let lastError = null;

        for (const provName of providersToTry) {
            try {
                // Circuit Breaker: Skip groq if rate-limited cooldown active
                if (provName === 'groq' && Date.now() < groqRateLimitedUntil) {
                    continue;
                }

                const instance = getProvider(provName);
                if (!instance.isAvailable()) continue;

                const text = await instance.chatComplete({
                    message,
                    systemInstruction: activeInstruction,
                    apiKey
                });
                res.json({ text, providerStatus: 'Success', isRateLimited: false });
                success = true;
                break;
            } catch (err) {
                console.warn(`[PROVIDER-COMPLETE-FALLBACK] ${provName} failed:`, err.message);
                lastError = err;

                // Trigger Circuit Breaker for Groq 429
                if (provName === 'groq' && (err.message.includes('429') || err.message.toLowerCase().includes('rate_limit') || err.message.toLowerCase().includes('quota'))) {
                    groqRateLimitedUntil = Date.now() + 60 * 1000;
                }
            }
        }

        // D. Ultimate Fallback to Local Engine on complete failure
        if (!success) {
            const ultimateLocal = isEnglish
                ? "Hello, I am MONI. All cloud AI providers are currently busy."
                : "Merhaba, ben MONI. Yapay zeka sağlayıcıları şu anda yoğun.";
            res.json({ text: ultimateLocal, providerStatus: 'Rate Limited Local Fallback', isRateLimited: true });
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
let elevenLabsDisabledSession = false;

app.post('/api/tts', async (req, res) => {
    try {
        const { text } = req.body;

        if (elevenLabsDisabledSession) {
            return res.status(403).json({ error: 'ElevenLabs disabled for session.' });
        }

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
                    if (voicesResponse.status === 401 || voicesResponse.status === 402) {
                        elevenLabsDisabledSession = true;
                        console.log('ELEVENLABS_DISABLED_SESSION');
                        console.log('Browser TTS Active');
                        return res.status(voicesResponse.status).json({ error: 'ElevenLabs disabled for session.' });
                    }
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
            
            if (ttsResponse.status === 401 || ttsResponse.status === 402) {
                elevenLabsDisabledSession = true;
                console.log('ELEVENLABS_DISABLED_SESSION');
                console.log('Browser TTS Active');
            }

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