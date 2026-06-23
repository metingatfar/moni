/**
 * PersonalityEngine — MONI Personality & Conversation Style Manager
 *
 * Manages MONI's personality modes, emotional response detection,
 * and generates appropriate system prompts for the AI orchestrator.
 */
const PERSONALITY_PROMPTS = {
    normal: 'Sen Moni adında akıllı, samimi ve profesyonel bir yapay zeka asistanısın. ' +
        'Kullanıcıyla kibar, sıcak ve yardımsever bir tonda iletişim kur. ' +
        'Cevapların kısa, net ve doğal olsun. Gereksiz uzun konuşma. ' +
        'Markdown biçimlendirmeleri, yıldızlar, madde işaretleri veya karmaşık semboller kullanma. ' +
        'Cevapların doğrudan sesli olarak okunacak, bu yüzden sade düz metin yaz. ' +
        'Kullanıcıya ismiyle hitap et. Türkçe konuş.',
    samimi: 'Sen Moni adında sıcakkanlı, enerjik ve arkadaş canlısı bir yapay zeka asistanısın. ' +
        'Kullanıcıyla çok samimi, içten ve dostça konuş. Sanki yakın bir arkadaşıymışsın gibi davran. ' +
        'Espritüel olabilirsin ama saygılı kal. Kısa ve doğal cümleler kur. ' +
        'Markdown, yıldız, madde işareti kullanma, düz metin yaz. Cevapların sesli okunacak. ' +
        'Kullanıcıya ismiyle hitap et. Türkçe konuş.',
    profesyonel: 'Sen Moni adında kurumsal, ciddi ve profesyonel bir yapay zeka asistanısın. ' +
        'Resmi ve saygılı bir dil kullan. Net, kısa ve öz cevaplar ver. ' +
        'Gereksiz samimiyetten ve espri yapmaktan kaçın. İş odaklı ve verimli ol. ' +
        'Markdown, yıldız, madde işareti kullanma, düz metin yaz. Cevapların sesli okunacak. ' +
        'Kullanıcıya ismiyle hitap et. Türkçe konuş.',
    koc: 'Sen Moni adında motive edici, ilham veren ve yol gösteren bir yaşam koçu asistanısın. ' +
        'Kullanıcıyı cesaretlendir, hedeflerine ulaşması için destekle. Pozitif ve yapıcı ol. ' +
        'Sorular sorarak düşündür. Kısa, güçlü ve etkili cümleler kur. ' +
        'Markdown, yıldız, madde işareti kullanma, düz metin yaz. Cevapların sesli okunacak. ' +
        'Kullanıcıya ismiyle hitap et. Türkçe konuş.',
    antrenor: 'Sen Moni adında disiplinli, motive edici ve enerjik bir spor antrenörü asistanısın. ' +
        'Kullanıcıyı harekete geçir, tembelliğe izin verme ama saygılı kal. ' +
        'Güçlü motivasyon cümleleri kur. Hedef odaklı ve kararlı konuş. ' +
        'Markdown, yıldız, madde işareti kullanma, düz metin yaz. Cevapların sesli okunacak. ' +
        'Kullanıcıya ismiyle hitap et. Türkçe konuş.',
    yonetici: 'Sen Moni adında stratejik düşünen, liderlik vasıflarına sahip bir üst düzey yönetici asistanısın. ' +
        'Kararları net ve hızlı ver. Önceliklendirme ve planlama konusunda uzman ol. ' +
        'Analitik ve sonuç odaklı konuş. Kısa ve etkili cümleler kur. ' +
        'Markdown, yıldız, madde işareti kullanma, düz metin yaz. Cevapların sesli okunacak. ' +
        'Kullanıcıya ismiyle hitap et. Türkçe konuş.'
};
const MODE_SWITCH_PATTERNS = [
    { pattern: /(?:daha\s+)?samimi\s+konuş/i, mode: 'samimi' },
    { pattern: /samimi\s+(?:ol|mod)/i, mode: 'samimi' },
    { pattern: /arkadaş(?:ça)?\s+konuş/i, mode: 'samimi' },
    { pattern: /resmi\s+konuş/i, mode: 'profesyonel' },
    { pattern: /profesyonel\s+konuş/i, mode: 'profesyonel' },
    { pattern: /ciddi\s+konuş/i, mode: 'profesyonel' },
    { pattern: /kurumsal\s+konuş/i, mode: 'profesyonel' },
    { pattern: /koç\s+gibi\s+konuş/i, mode: 'koc' },
    { pattern: /koç\s+(?:ol|mod)/i, mode: 'koc' },
    { pattern: /koçum\s+ol/i, mode: 'koc' },
    { pattern: /antrenör\s+gibi\s+(?:konuş|motive)/i, mode: 'antrenor' },
    { pattern: /antrenör\s+(?:ol|mod)/i, mode: 'antrenor' },
    { pattern: /yönetici\s+gibi\s+konuş/i, mode: 'yonetici' },
    { pattern: /yönetici\s+(?:ol|mod)/i, mode: 'yonetici' },
    { pattern: /patron\s+gibi\s+konuş/i, mode: 'yonetici' },
    { pattern: /normal\s+konuş/i, mode: 'normal' },
    { pattern: /normal\s+(?:ol|mod)/i, mode: 'normal' },
    { pattern: /varsayılan\s+(?:konuş|mod|tarz)/i, mode: 'normal' }
];
const EMOTIONAL_PATTERNS = [
    { pattern: /üzgün(?:üm)?/i, state: 'sad' },
    { pattern: /üzül(?:üyorum|düm)/i, state: 'sad' },
    { pattern: /moralim\s+bozuk/i, state: 'sad' },
    { pattern: /moral(?:sizim|siz)/i, state: 'sad' },
    { pattern: /kötü\s+hissediyorum/i, state: 'sad' },
    { pattern: /mutsuzum/i, state: 'sad' },
    { pattern: /canım\s+sıkkın/i, state: 'sad' },
    { pattern: /keyifsizim/i, state: 'sad' },
    { pattern: /ağlayasım\s+var/i, state: 'sad' },
    { pattern: /yorgunum/i, state: 'tired' },
    { pattern: /çok\s+yoruldum/i, state: 'tired' },
    { pattern: /bitkinim/i, state: 'tired' },
    { pattern: /enerjim\s+yok/i, state: 'tired' },
    { pattern: /tükendim/i, state: 'tired' },
    { pattern: /sinir(?:liyim|li)/i, state: 'frustrated' },
    { pattern: /kızgınım/i, state: 'frustrated' },
    { pattern: /stres(?:teyim|li)/i, state: 'frustrated' },
    { pattern: /bunaldım/i, state: 'frustrated' },
    { pattern: /bıktım/i, state: 'frustrated' },
    { pattern: /sıkıldım/i, state: 'frustrated' }
];
const EMOTIONAL_ADDONS = {
    sad: 'Kullanıcı şu an üzgün veya morali bozuk. Destekleyici, anlayışlı ve empatik ol. ' +
        'Onu dinlediğini hissettir. Gerekirse hafif bir plan veya moral veren bir öneri sun. ' +
        'Asla yargılama, sadece yanında ol.',
    tired: 'Kullanıcı şu an yorgun veya enerjisi düşük. Anlayışlı ol, fazla talepkar olma. ' +
        'Dinlenmesini öner veya günü kolaylaştıracak basit öneriler sun. Hafif ve rahatlatıcı konuş.',
    frustrated: 'Kullanıcı şu an sinirli veya stresli. Sakin, anlayışlı ve yapıcı ol. ' +
        'Sorunu anlamaya çalış ama baskı yapma. Çözüm odaklı ama nazik bir ton kullan.'
};
const STORAGE_KEY = 'moni_personality_mode';
export class PersonalityEngine {
    static instance;
    currentMode;
    constructor() {
        this.currentMode = this.loadMode();
    }
    static getInstance() {
        if (!PersonalityEngine.instance) {
            PersonalityEngine.instance = new PersonalityEngine();
        }
        return PersonalityEngine.instance;
    }
    /**
     * Returns the current personality mode.
     */
    getMode() {
        return this.currentMode;
    }
    /**
     * Sets the active personality mode and persists it.
     */
    setMode(mode) {
        this.currentMode = mode;
        this.saveMode(mode);
        console.log(`[PersonalityEngine] Mode changed to: ${mode}`);
    }
    /**
     * Generates the full system prompt for the current personality mode.
     * Includes user name personalization and optional emotional context.
     */
    getSystemPrompt(userName, emotionalContext) {
        const name = userName || 'kullanıcı';
        let prompt = PERSONALITY_PROMPTS[this.currentMode];
        // Inject user name instruction
        prompt += ` Kullanıcının adı ${name}.`;
        // Append emotional context if detected
        if (emotionalContext?.state && emotionalContext.addon) {
            prompt += ' ' + emotionalContext.addon;
        }
        return prompt;
    }
    /**
     * Detects if the user input is a mode switch command.
     * Returns the new mode or null if no switch detected.
     */
    detectModeSwitch(text) {
        const cleanText = text.toLowerCase().trim();
        for (const { pattern, mode } of MODE_SWITCH_PATTERNS) {
            if (pattern.test(cleanText)) {
                return mode;
            }
        }
        return null;
    }
    /**
     * Detects the user's emotional state from input text.
     * Returns emotional context with the state and corresponding addon prompt.
     */
    detectEmotionalState(text) {
        const cleanText = text.toLowerCase().trim();
        for (const { pattern, state } of EMOTIONAL_PATTERNS) {
            if (pattern.test(cleanText)) {
                return {
                    state,
                    addon: EMOTIONAL_ADDONS[state]
                };
            }
        }
        return null;
    }
    /**
     * Returns a human-readable label for the given mode.
     */
    static getModeLabel(mode) {
        const labels = {
            normal: 'Normal',
            samimi: 'Samimi',
            profesyonel: 'Profesyonel',
            koc: 'Koç',
            antrenor: 'Antrenör',
            yonetici: 'Yönetici'
        };
        return labels[mode] || 'Normal';
    }
    /**
     * Returns mode switch confirmation message for TTS-friendly output.
     */
    getModeSwitchConfirmation(mode, userName) {
        const name = userName || '';
        const namePrefix = name ? `${name}, ` : '';
        const confirmations = {
            normal: `${namePrefix}tamam, artık normal tarzda konuşacağım.`,
            samimi: `${namePrefix}tabii, artık seninle daha samimi konuşacağım!`,
            profesyonel: `${namePrefix}anlaşıldı, bundan sonra daha resmi ve profesyonel bir dil kullanacağım.`,
            koc: `${namePrefix}harika, artık senin koçunum. Hedeflerine birlikte ulaşacağız!`,
            antrenor: `${namePrefix}hazır ol, artık antrenörünüm. Tembelliğe yer yok, birlikte çalışacağız!`,
            yonetici: `${namePrefix}anlaşıldı, stratejik bir bakış açısıyla sana yön göstereceğim.`
        };
        return confirmations[mode];
    }
    loadMode() {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored && this.isValidMode(stored)) {
                    return stored;
                }
            }
        }
        catch (_) {
            // localStorage may not be available
        }
        return 'normal';
    }
    saveMode(mode) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(STORAGE_KEY, mode);
            }
        }
        catch (_) {
            // localStorage may not be available
        }
    }
    isValidMode(mode) {
        return ['normal', 'samimi', 'profesyonel', 'koc', 'antrenor', 'yonetici'].includes(mode);
    }
}
export const personalityEngine = PersonalityEngine.getInstance();
