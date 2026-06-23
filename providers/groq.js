// ============================================================
// Groq LLM Provider
// Uses Groq's OpenAI-compatible REST API (no external SDK needed).
// ============================================================

const GROQ_API_BASE = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

/**
 * Converts MONI chat history to OpenAI-style messages array.
 */
function buildMessages(message, history, systemInstruction) {
    const messages = [];

    if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
    }

    if (history && Array.isArray(history)) {
        const filtered = history
            .filter(m => m.content && m.content.trim() !== '' && m.role !== 'system')
            .map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            }));

        // Keep last 15 messages
        const sliced = filtered.length > 15 ? filtered.slice(-15) : filtered;
        messages.push(...sliced);
    }

    messages.push({ role: 'user', content: message });

    return messages;
}

/**
 * Streaming chat via Groq API → SSE to client.
 * @param {object} options
 * @param {string} options.message - User message
 * @param {Array} [options.history] - Chat history
 * @param {string} [options.systemInstruction] - System prompt
 * @param {import('express').Response} options.res - Express response for SSE
 */
export async function chatStream({ message, history, systemInstruction, res }) {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
        throw new Error('Groq API anahtarı tanımlı değil.');
    }

    const messages = buildMessages(message, history, systemInstruction);

    const response = await fetch(GROQ_API_BASE, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: DEFAULT_MODEL,
            messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Groq API Hatası (${response.status}): ${errBody}`);
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Parse Groq SSE stream → forward as MONI SSE format
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            const payload = trimmed.substring(6);
            if (payload === '[DONE]') continue;

            try {
                const parsed = JSON.parse(payload);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                    res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
                }
            } catch (_) {
                // Ignore parse errors in stream
            }
        }
    }

    res.end();
}

/**
 * Non-streaming single completion (for memory extraction, daily brief, etc.)
 * @param {object} options
 * @param {string} options.message - User message / prompt
 * @param {string} [options.systemInstruction] - System prompt
 * @returns {Promise<string>} Full response text
 */
export async function chatComplete({ message, systemInstruction }) {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
        throw new Error('Groq API anahtarı tanımlı değil.');
    }

    const messages = buildMessages(message, null, systemInstruction);

    const response = await fetch(GROQ_API_BASE, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: DEFAULT_MODEL,
            messages,
            stream: false,
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Groq API Hatası (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

export const providerName = 'groq';

export function isAvailable() {
    return !!process.env.GROQ_API_KEY;
}
