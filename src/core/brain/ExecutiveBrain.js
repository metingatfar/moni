import { ContextBuilder } from '../memory/ContextBuilder';
import { ResponseProcessor } from '../ai/ResponseProcessor';
import { eventBus } from '../events/EventBus';
import { telemetry } from '../telemetry/Telemetry';
import { personalityEngine } from '../personality/PersonalityEngine';
export class ExecutiveBrain {
    aiOrchestrator;
    planner;
    toolManager;
    shortTermMemory;
    longTermMemory;
    userName;
    constructor(aiOrchestrator, planner, toolManager, shortTermMemory, longTermMemory, userName) {
        this.aiOrchestrator = aiOrchestrator;
        this.planner = planner;
        this.toolManager = toolManager;
        this.shortTermMemory = shortTermMemory;
        this.longTermMemory = longTermMemory;
        this.userName = userName || 'Metin';
    }
    /**
     * Update the user name (e.g. when loaded from memory store).
     */
    setUserName(name) {
        this.userName = name;
    }
    /**
     * Main entry point to process any user speech/text command.
     */
    async processInput(userInput, onChunk) {
        return this.execute(userInput, onChunk);
    }
    /**
     * Main entry point to process any user speech/text command.
     */
    async execute(userInput, onChunk) {
        const startTime = Date.now();
        eventBus.publish('PipelineStarted', { input: userInput });
        console.log('[ExecutiveBrain] Initiating execution cycle for:', userInput);
        try {
            // 0. Personality: detect mode switch command
            const modeSwitchTarget = personalityEngine.detectModeSwitch(userInput);
            if (modeSwitchTarget) {
                personalityEngine.setMode(modeSwitchTarget);
                const confirmation = personalityEngine.getModeSwitchConfirmation(modeSwitchTarget, this.userName);
                this.shortTermMemory.addMessage('user', userInput);
                this.shortTermMemory.addMessage('assistant', confirmation);
                onChunk(confirmation);
                eventBus.publish('PersonalityModeChanged', { mode: modeSwitchTarget });
                const totalTime = Date.now() - startTime;
                telemetry.recordLatency('ExecutiveBrain', totalTime);
                eventBus.publish('PipelineCompleted', { input: userInput, output: confirmation, duration: totalTime });
                return confirmation;
            }
            // 0b. Personality: detect emotional state
            const emotionalContext = personalityEngine.detectEmotionalState(userInput);
            if (emotionalContext) {
                console.log(`[ExecutiveBrain] Emotional state detected: ${emotionalContext.state}`);
            }
            // 1. Save user input to short term memory
            this.shortTermMemory.addMessage('user', userInput);
            // 2. Memory Interceptions
            const lowerInput = userInput.toLowerCase();
            // A. Memory Delete Command Detection
            const isDeleteRequest = (lowerInput.includes('unut') && !lowerInput.includes('unutma')) || lowerInput.includes('sil');
            if (isDeleteRequest) {
                await this.handleMemoryDelete(userInput);
            }
            // B. Explicit Memory Save Command Detection
            const saveTriggers = ['bunu hatırla', 'unutma', 'aklında tut', 'hafızana al', 'hafızaya kaydet'];
            const isExplicitSave = saveTriggers.some(t => lowerInput.includes(t));
            if (isExplicitSave) {
                await this.handleExplicitMemorySave(userInput);
            }
            // 3. Intent analysis / Planning
            const plan = await this.planner.plan(userInput);
            // Calculate intent confidence score
            let confidenceScore = 1.0;
            const wordsCount = userInput.trim().split(/\s+/).length;
            if (plan.steps.length > 0) {
                const hasDirectTriggers = ['toplantı', 'toplanti', 'görev', 'gorev', 'hatırlat', 'hatirlat', 'planla', 'ekle', 'kaydet'].some(w => userInput.toLowerCase().includes(w));
                if (wordsCount <= 2 && !hasDirectTriggers) {
                    confidenceScore = 0.3; // Low confidence
                }
            }
            if (confidenceScore < 0.5) {
                plan.steps = [];
                plan.recommendations = [];
            }
            // 4. Execute tools if the plan requested any actions
            const toolResults = [];
            for (const step of plan.steps) {
                let toolName = step.type;
                if (toolName === 'task')
                    toolName = 'tasks';
                if (toolName === 'reminder')
                    toolName = 'reminders';
                if (toolName === 'note')
                    toolName = 'memory';
                if (this.toolManager.getTool(toolName)) {
                    try {
                        const res = await this.toolManager.executeTool(toolName, {
                            action: step.action === 'create_task' ? 'add' : step.action === 'create_reminder' ? 'add' : 'list',
                            title: step.payload.title,
                            priority: step.payload.priority
                        });
                        toolResults.push(res);
                    }
                    catch (err) {
                        console.error(`[ExecutiveBrain] Tool execution failed for: ${toolName}`, err);
                    }
                }
            }
            // 5. Retrieve matching facts from long term memory
            const facts = this.longTermMemory.search(userInput);
            // 6. Build rich prompt context
            const recentMessages = this.shortTermMemory.getMessages();
            const context = ContextBuilder.buildPromptContext('', facts, recentMessages);
            // 7. Build personality-aware system instruction
            const personalitySystemPrompt = personalityEngine.getSystemPrompt(this.userName, emotionalContext);
            const fullSystemInstruction = `${personalitySystemPrompt}\n\nSistem Bilgisi/Bağlam:\n${context}\n\nÖneriler:\n${plan.recommendations.join('\n')}`;
            // 8. Generate reply via AI Orchestrator
            let finalAnswer = '';
            await this.aiOrchestrator.chatStream({
                message: userInput,
                systemInstruction: fullSystemInstruction,
                history: recentMessages
            }, (chunk) => {
                finalAnswer += chunk;
                onChunk(chunk);
            });
            // 9. Sanitize response for TTS suitability and save to short term memory
            const cleanAnswer = ResponseProcessor.sanitizeForSpeech(finalAnswer);
            this.shortTermMemory.addMessage('assistant', cleanAnswer);
            // 10. Asynchronous Implicit Memory Extraction (Background)
            if (!isExplicitSave && !isDeleteRequest) {
                this.runImplicitExtraction(userInput).catch(err => {
                    console.error('[ExecutiveBrain] Implicit extraction failed:', err);
                });
            }
            const totalTime = Date.now() - startTime;
            telemetry.recordLatency('ExecutiveBrain', totalTime);
            eventBus.publish('PipelineCompleted', { input: userInput, output: cleanAnswer, duration: totalTime });
            return cleanAnswer;
        }
        catch (error) {
            const totalTime = Date.now() - startTime;
            eventBus.publish('PipelineFailed', { input: userInput, error: error.message || error, duration: totalTime });
            throw error;
        }
    }
    /**
     * Helper to handle explicit memory saving commands
     */
    async handleExplicitMemorySave(input) {
        try {
            console.log('[ExecutiveBrain] Extracting explicit memory fact...');
            const extractionPrompt = `Aşağıdaki Türkçe metinden kullanıcının hafızaya kaydetmek istediği net bilgiyi çıkar ve uygun kategoriyi seç.
Kategoriler:
- 'identity': kullanıcının adı, yaşı vb. kimlik bilgileri.
- 'preference': kahveyi şekersiz içmesi vb. zevk ve tercihleri.
- 'health': kullandığı ilaçlar, hastalıklar, alerjiler vb. sağlık bilgileri.
- 'sport': sevdiği sporlar, badminton vb. spor alışkanlıkları.
- 'work': mesleği, çalıştığı şirket, projeleri vb. iş/çalışma bilgileri.
- 'relationship': eşi, çocuğu, arkadaşları vb. ilişkiler.
- 'routine': günlük rutinleri, alışkanlıkları.
- 'goal': hedefleri (örneğin 90 kiloya düşmek).
- 'location': ev adresi, ofis konumu vb. konumlar.
- 'custom': diğer kategorilere uymayan önemli kalıcı notlar.

Çıktıyı SADECE JSON formatında ver, markdown kod bloğu kullanma. JSON şeması:
{
  "category": "kategori_adi",
  "content": "özetlenmiş net bilgi içeriği (örneğin: 'Kahveyi şekersiz içmeyi sever')"
}

İfade: "${input}"`;
            const response = await this.aiOrchestrator.chatComplete({
                message: extractionPrompt,
                systemInstruction: "Sen bir veri çıkarma robotusun. Çıktı olarak sadece geçerli JSON döndürürsün."
            });
            const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (parsed.content && parsed.category) {
                await this.longTermMemory.addFact(parsed.content, parsed.category, 1.0, 'explicit', 4);
            }
        }
        catch (e) {
            console.error('[ExecutiveBrain] Failed to parse or save explicit memory:', e);
        }
    }
    /**
     * Helper to handle memory deletion requests
     */
    async handleMemoryDelete(input) {
        try {
            const facts = this.longTermMemory.getFacts();
            if (facts.length === 0)
                return;
            console.log('[ExecutiveBrain] Analyzing memory deletion request...');
            const deletePrompt = `Kullanıcı şu silme/unutma talebini iletti: "${input}"
Mevcut hafıza kayıtları listesi:
${facts.map(f => `ID: ${f.id} - Kategori: ${f.category} - İçerik: ${f.content}`).join('\n')}

Silinmesi istenen kayıtların ID'lerini bul ve KESİNLİKLE sadece şu JSON şemasında döndür:
{
  "delete": true,
  "ids": ["id1", "id2"]
}
Eğer silinmesi istenen bir kayıt bulunamazsa veya eşleşmiyorsa, "delete": false döndür.`;
            const response = await this.aiOrchestrator.chatComplete({
                message: deletePrompt,
                systemInstruction: "Sen bir veri çıkarma robotusun. Çıktı olarak sadece geçerli JSON döndürürsün."
            });
            const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (parsed.delete && Array.isArray(parsed.ids)) {
                for (const id of parsed.ids) {
                    await this.longTermMemory.deleteFact(id);
                    console.log(`[ExecutiveBrain] Memory deleted successfully: ${id}`);
                }
            }
        }
        catch (e) {
            console.error('[ExecutiveBrain] Failed to parse or handle memory delete:', e);
        }
    }
    /**
     * Helper to handle background/implicit memory extraction
     */
    async runImplicitExtraction(input) {
        // Only trigger extraction if input contains keywords indicating a personal statement
        const keywords = [
            'benim', 'ben', 'seviyorum', 'severim', 'adım', 'ismim',
            'mesleğim', 'hedefim', 'projem', 'yaşım', 'çalışıyorum',
            'rutinim', 'adresim', 'ofisim', 'kullanıyorum', 'kilo', 'ilaç', 'spor'
        ];
        const hasKeywords = keywords.some(k => input.toLowerCase().includes(k));
        if (!hasKeywords)
            return;
        try {
            console.log('[ExecutiveBrain] Analyzing message for implicit memories...');
            const implicitPrompt = `Aşağıdaki Türkçe metinden kullanıcının kalıcı (uzun vadeli) bilgisini veya tercihini çıkartıp JSON formatında döndür.
Eğer metin geçici bir bilgi içeriyorsa ("Bugün hava güzel", "Şimdi çıkıyorum", "merhaba") veya kaydedilmeye değer kalıcı bir bilgi yoksa, "save": false döndür.
Önemli kalıcı bilgi kategorileri:
- 'identity': kullanıcının adı, yaş bilgisi.
- 'preference': zevk ve tercihleri.
- 'health': kullandığı ilaçlar, hastalıkları vb. sağlık bilgileri.
- 'sport': sevdiği sporlar, spor alışkanlıkları.
- 'work': mesleği, projeleri vb. iş/çalışma bilgileri.
- 'relationship': eşi, çocuğu, arkadaşları vb. ilişkiler.
- 'routine': günlük rutinleri, alışkanlıkları.
- 'goal': hedefleri (örneğin 90 kiloya düşmek).
- 'location': ev adresi, ofis konumu vb.
- 'custom': diğer kategorilere uymayan önemli kalıcı notlar.

Çıktıyı SADECE JSON formatında ver, markdown kod bloğu kullanma. JSON şeması:
{
  "save": true,
  "category": "kategori_adi",
  "content": "özetlenmiş net Türkçe bilgi (örneğin: 'Kahvesini şekersiz içer.' veya 'Hedefi 90 kiloya düşmektir.')",
  "confidence": 0.9,
  "importance": 3
}
Eğer kaydedilecek kalıcı bir bilgi yoksa:
{
  "save": false
}

Metin: "${input}"`;
            const response = await this.aiOrchestrator.chatComplete({
                message: implicitPrompt,
                systemInstruction: "Sen bir veri çıkarma robotusun. Çıktı olarak sadece geçerli JSON döndürürsün."
            });
            const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (parsed.save && parsed.content && parsed.category) {
                await this.longTermMemory.addFact(parsed.content, parsed.category, parsed.confidence || 0.8, 'implicit', parsed.importance || 3);
                console.log(`[ExecutiveBrain] Implicitly extracted and saved memory: ${parsed.content} (${parsed.category})`);
            }
        }
        catch (e) {
            console.error('[ExecutiveBrain] Implicit memory extraction failed:', e);
        }
    }
}
