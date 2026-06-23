import { PromptBuilder } from './PromptBuilder';
import { telemetry } from '../telemetry/Telemetry';
import { eventBus } from '../events/EventBus';
import { getEndpoint } from '../../config/api';
export class AIOrchestrator {
    activeProviderName = 'gemini';
    constructor(initialProvider = 'gemini') {
        this.activeProviderName = initialProvider;
    }
    getActiveProviderName() {
        return this.activeProviderName;
    }
    setActiveProvider(providerName) {
        const oldProvider = this.activeProviderName;
        this.activeProviderName = providerName;
        if (oldProvider !== providerName) {
            eventBus.publish('ProviderChanged', providerName);
        }
    }
    /**
     * Complete chat request with automatic fallback (failover).
     */
    async chatComplete(options) {
        const provider = options.provider || this.activeProviderName;
        const systemPrompt = PromptBuilder.buildSystemInstruction(options.systemInstruction);
        const userPrompt = PromptBuilder.buildUserPrompt(options.message);
        const targetUrl = getEndpoint('chat/complete');
        const start = Date.now();
        try {
            console.log(`[AIOrchestrator] Sending complete request to ${provider}`);
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userPrompt,
                    systemInstruction: systemPrompt,
                    provider: provider,
                    apiKey: options.apiKey
                })
            });
            if (!response.ok) {
                if (response.status === 404) {
                    window.dispatchEvent(new CustomEvent('moni_info_notification', {
                        detail: { message: 'Backend güncel değil veya yanlış API adresine bağlanıldı.' }
                    }));
                    throw new Error("Backend güncel değil veya yanlış API adresine bağlanıldı.");
                }
                throw new Error(`HTTP Error ${response.status}`);
            }
            const duration = Date.now() - start;
            telemetry.recordLatency(provider, duration);
            const data = await response.json();
            return data.text || '';
        }
        catch (err) {
            console.warn(`[AIOrchestrator] ${provider} complete request failed, trying failover...`, err);
            // Fallback to the other provider
            const fallbackProvider = provider === 'gemini' ? 'groq' : 'gemini';
            const fallbackStart = Date.now();
            try {
                console.log(`[AIOrchestrator] Failover complete request to ${fallbackProvider}`);
                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: userPrompt,
                        systemInstruction: systemPrompt,
                        provider: fallbackProvider,
                        apiKey: options.apiKey
                    })
                });
                if (!response.ok)
                    throw new Error(`HTTP Error ${response.status}`);
                const duration = Date.now() - fallbackStart;
                telemetry.recordLatency(fallbackProvider, duration);
                const data = await response.json();
                return data.text || '';
            }
            catch (fallbackErr) {
                console.error(`[AIOrchestrator] Failover complete request also failed:`, fallbackErr);
                throw fallbackErr;
            }
        }
    }
    /**
     * Stream chat request with automatic fallback (failover).
     */
    async chatStream(options, onChunk) {
        const provider = options.provider || this.activeProviderName;
        const systemPrompt = PromptBuilder.buildSystemInstruction(options.systemInstruction);
        const userPrompt = PromptBuilder.buildUserPrompt(options.message);
        const targetUrl = getEndpoint('chat/stream');
        const start = Date.now();
        try {
            await this.executeStreamFetch(targetUrl, provider, userPrompt, options.history || [], systemPrompt, options.apiKey, onChunk, start);
        }
        catch (err) {
            console.warn(`[AIOrchestrator] ${provider} stream failed, trying failover...`, err);
            const fallbackProvider = provider === 'gemini' ? 'groq' : 'gemini';
            const fallbackStart = Date.now();
            try {
                await this.executeStreamFetch(targetUrl, fallbackProvider, userPrompt, options.history || [], systemPrompt, options.apiKey, onChunk, fallbackStart);
            }
            catch (fallbackErr) {
                console.error(`[AIOrchestrator] Failover stream also failed:`, fallbackErr);
                throw fallbackErr;
            }
        }
    }
    async executeStreamFetch(url, provider, message, history, systemInstruction, apiKey, onChunk, startTime) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history, systemInstruction, provider, apiKey })
        });
        if (!response.ok) {
            throw new Error(`Stream HTTP Error ${response.status}`);
        }
        if (!response.body) {
            throw new Error('ReadableStream not supported.');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let isFirstToken = true;
        while (true) {
            const { value, done } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                const cleanedLine = line.trim();
                if (cleanedLine.startsWith('data: ')) {
                    try {
                        const jsonData = JSON.parse(cleanedLine.substring(6));
                        if (jsonData.text) {
                            if (isFirstToken) {
                                isFirstToken = false;
                                const firstTokenLatency = Date.now() - startTime;
                                telemetry.recordLatency(`${provider}_first_token`, firstTokenLatency);
                            }
                            onChunk(jsonData.text);
                        }
                    }
                    catch (_) {
                        // Ignore parse errors
                    }
                }
            }
        }
        const totalLatency = Date.now() - startTime;
        telemetry.recordLatency(provider, totalLatency);
    }
}
