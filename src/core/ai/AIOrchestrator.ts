import type { ChatMessage, LLMRequestOptions } from './LLMProvider';
import { PromptBuilder } from './PromptBuilder';
import { telemetry } from '../telemetry/Telemetry';
import { eventBus } from '../events/EventBus';
import { getEndpoint } from '../../config/api';

export class AIOrchestrator {
  private activeProviderName: 'gemini' | 'groq' = 'gemini';

  // Check if we are running in a Node test context (like tsx test runs)
  public static isTestMode = typeof globalThis !== 'undefined' && 
    (!!(globalThis as any).process && 
     (
       (globalThis as any).process.env?.NODE_ENV === 'test' || 
       (Array.isArray((globalThis as any).process.argv) && (globalThis as any).process.argv.some((arg: string) => arg.includes('test_') || arg.includes('unit')))
     ));

  // Cooldown states
  private static cooldowns: Record<'gemini' | 'groq', number> = {
    gemini: 0,
    groq: 0
  };
  private static quotaExceeded: Record<'gemini' | 'groq', boolean> = {
    gemini: false,
    groq: false
  };

  constructor(initialProvider: 'gemini' | 'groq' = 'gemini') {
    this.activeProviderName = initialProvider;
  }

  public getActiveProviderName(): 'gemini' | 'groq' {
    return this.activeProviderName;
  }

  public setActiveProvider(providerName: 'gemini' | 'groq'): void {
    const oldProvider = this.activeProviderName;
    this.activeProviderName = providerName;
    if (oldProvider !== providerName) {
      eventBus.publish('ProviderChanged', providerName);
    }
  }

  public getProviderStatus(provider: 'gemini' | 'groq'): string {
    const now = Date.now();
    if (AIOrchestrator.quotaExceeded[provider] || AIOrchestrator.cooldowns[provider] > now) {
      return 'Kota doldu';
    }
    return 'Hazır';
  }

  public getLlmMode(): string {
    const now = Date.now();
    const geminiCd = AIOrchestrator.quotaExceeded.gemini || AIOrchestrator.cooldowns.gemini > now;
    const groqCd = AIOrchestrator.quotaExceeded.groq || AIOrchestrator.cooldowns.groq > now;
    if (geminiCd && groqCd) {
      return 'Cooldown';
    }
    return 'Normal';
  }

  private isProviderInCooldown(provider: 'gemini' | 'groq'): boolean {
    const now = Date.now();
    return AIOrchestrator.quotaExceeded[provider] || AIOrchestrator.cooldowns[provider] > now;
  }

  private handle429(provider: 'gemini' | 'groq', errorMsg: string): void {
    AIOrchestrator.quotaExceeded[provider] = true;
    
    // Parse retry duration from errorMsg if possible.
    let cooldownDurationMs = 60 * 1000; // Default 60 seconds
    
    const secondsMatch = errorMsg.match(/(?:retry after|try again in|reset in|in)?\s*(\d+)\s*(?:s|sec|seconds)/i);
    if (secondsMatch) {
      cooldownDurationMs = parseInt(secondsMatch[1], 10) * 1000;
    } else {
      const minutesMatch = errorMsg.match(/(\d+)\s*(?:m|min|minutes)/i);
      if (minutesMatch) {
        cooldownDurationMs = parseInt(minutesMatch[1], 10) * 60 * 1000;
      }
    }
    
    AIOrchestrator.cooldowns[provider] = Date.now() + cooldownDurationMs;
    console.warn(`[AIOrchestrator] Provider ${provider} is put on cooldown for ${cooldownDurationMs}ms due to 429 quota limit.`);
  }

  /**
   * Complete chat request with automatic fallback (failover).
   */
  public async chatComplete(options: LLMRequestOptions): Promise<string> {
    if (AIOrchestrator.isTestMode) {
      console.log(`[AIOrchestrator] [TEST MODE] Mocking complete response for: ${options.message}`);
      const msg = options.message.toLowerCase();
      if (msg.includes('json') || msg.includes('şema') || msg.includes('format')) {
        if (msg.includes('category') || msg.includes('kategori')) {
          return JSON.stringify({ category: 'health', content: 'Mocked health fact' });
        }
        if (msg.includes('save')) {
          return JSON.stringify({ save: false });
        }
        return JSON.stringify({});
      }
      return "Mock AI Response";
    }

    const provider = options.provider || this.activeProviderName;

    // Check if both are in cooldown
    if (this.isProviderInCooldown('gemini') && this.isProviderInCooldown('groq')) {
      return "Yapay zeka servislerinin günlük kullanım limiti doldu. Bir süre sonra tekrar deneyelim.";
    }

    // Determine target provider (use fallback if target is in cooldown)
    let selectedProvider = provider;
    if (this.isProviderInCooldown(selectedProvider)) {
      selectedProvider = selectedProvider === 'gemini' ? 'groq' : 'gemini';
    }

    const systemPrompt = PromptBuilder.buildSystemInstruction(options.systemInstruction);
    const userPrompt = PromptBuilder.buildUserPrompt(options.message);
    const targetUrl = getEndpoint('chat/complete');
    const start = Date.now();

    try {
      console.log(`[AIOrchestrator] Sending complete request to ${selectedProvider}`);
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          systemInstruction: systemPrompt,
          provider: selectedProvider,
          apiKey: options.apiKey
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        if (response.status === 429 || errorText.includes('429') || errorText.toLowerCase().includes('quota') || errorText.toLowerCase().includes('limit exceeded') || errorText.toLowerCase().includes('rate limit')) {
          this.handle429(selectedProvider, errorText);
          throw new Error(`429:${errorText}`);
        }
        throw new Error(`HTTP Error ${response.status}: ${errorText}`);
      }

      const duration = Date.now() - start;
      telemetry.recordLatency(selectedProvider, duration);
      const data = await response.json();
      return data.text || '';
    } catch (err: any) {
      console.warn(`[AIOrchestrator] ${selectedProvider} request failed, checking failover...`, err.message);
      
      // If both are now in cooldown, do not failover.
      if (this.isProviderInCooldown('gemini') && this.isProviderInCooldown('groq')) {
        return "Yapay zeka servislerinin günlük kullanım limiti doldu. Bir süre sonra tekrar deneyelim.";
      }

      const fallbackProvider = selectedProvider === 'gemini' ? 'groq' : 'gemini';
      if (this.isProviderInCooldown(fallbackProvider)) {
        return "Yapay zeka servislerinin günlük kullanım limiti doldu. Bir süre sonra tekrar deneyelim.";
      }

      console.log(`[AIOrchestrator] Trying failover to ${fallbackProvider}`);
      const fallbackStart = Date.now();
      try {
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

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          if (response.status === 429 || errorText.includes('429') || errorText.toLowerCase().includes('quota') || errorText.toLowerCase().includes('limit exceeded') || errorText.toLowerCase().includes('rate limit')) {
            this.handle429(fallbackProvider, errorText);
            throw new Error(`429:${errorText}`);
          }
          throw new Error(`HTTP Error ${response.status}: ${errorText}`);
        }

        const duration = Date.now() - fallbackStart;
        telemetry.recordLatency(fallbackProvider, duration);
        const data = await response.json();
        return data.text || '';
      } catch (fallbackErr: any) {
        console.error(`[AIOrchestrator] Failover request also failed:`, fallbackErr.message);
        if (fallbackErr.message.startsWith('429') || (this.isProviderInCooldown('gemini') && this.isProviderInCooldown('groq'))) {
          return "Yapay zeka servislerinin günlük kullanım limiti doldu. Bir süre sonra tekrar deneyelim.";
        }
        throw fallbackErr;
      }
    }
  }

  /**
   * Stream chat request with automatic fallback (failover).
   */
  public async chatStream(
    options: LLMRequestOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (AIOrchestrator.isTestMode) {
      console.log(`[AIOrchestrator] [TEST MODE] Mocking stream response.`);
      onChunk("Mock AI Response");
      return;
    }

    const provider = options.provider || this.activeProviderName;

    // Check if both are in cooldown
    if (this.isProviderInCooldown('gemini') && this.isProviderInCooldown('groq')) {
      onChunk("Yapay zeka servislerinin günlük kullanım limiti doldu. Bir süre sonra tekrar deneyelim.");
      return;
    }

    let selectedProvider = provider;
    if (this.isProviderInCooldown(selectedProvider)) {
      selectedProvider = selectedProvider === 'gemini' ? 'groq' : 'gemini';
    }

    const systemPrompt = PromptBuilder.buildSystemInstruction(options.systemInstruction);
    const userPrompt = PromptBuilder.buildUserPrompt(options.message);
    const targetUrl = getEndpoint('chat/stream');
    const start = Date.now();

    try {
      await this.executeStreamFetch(targetUrl, selectedProvider, userPrompt, options.history || [], systemPrompt, options.apiKey, onChunk, start);
    } catch (err: any) {
      console.warn(`[AIOrchestrator] ${selectedProvider} stream failed, trying failover...`, err.message);
      
      if (this.isProviderInCooldown('gemini') && this.isProviderInCooldown('groq')) {
        onChunk("Yapay zeka servislerinin günlük kullanım limiti doldu. Bir süre sonra tekrar deneyelim.");
        return;
      }

      const fallbackProvider = selectedProvider === 'gemini' ? 'groq' : 'gemini';
      if (this.isProviderInCooldown(fallbackProvider)) {
        onChunk("Yapay zeka servislerinin günlük kullanım limiti doldu. Bir süre sonra tekrar deneyelim.");
        return;
      }

      const fallbackStart = Date.now();
      try {
        await this.executeStreamFetch(targetUrl, fallbackProvider, userPrompt, options.history || [], systemPrompt, options.apiKey, onChunk, fallbackStart);
      } catch (fallbackErr: any) {
        console.error(`[AIOrchestrator] Failover stream also failed:`, fallbackErr.message);
        if (this.isProviderInCooldown('gemini') && this.isProviderInCooldown('groq')) {
          onChunk("Yapay zeka servislerinin günlük kullanım limiti doldu. Bir süre sonra tekrar deneyelim.");
          return;
        }
        throw fallbackErr;
      }
    }
  }

  private async executeStreamFetch(
    url: string,
    provider: 'gemini' | 'groq',
    message: string,
    history: ChatMessage[],
    systemInstruction: string,
    apiKey: string | undefined,
    onChunk: (chunk: string) => void,
    startTime: number
  ): Promise<void> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, systemInstruction, provider, apiKey })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'No error body');
      console.error(`[AIOrchestrator] Stream fetch failed: ${response.status} - ${errText}`);
      if (response.status === 429 || errText.includes('429') || errText.toLowerCase().includes('quota') || errText.toLowerCase().includes('limit exceeded') || errText.toLowerCase().includes('rate limit')) {
        this.handle429(provider, errText);
      }
      throw new Error(`Stream HTTP Error ${response.status}: ${errText}`);
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
      if (done) break;

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
          } catch (_) {
            // Ignore parse errors
          }
        }
      }
    }
    const totalLatency = Date.now() - startTime;
    telemetry.recordLatency(provider, totalLatency);
  }
}
