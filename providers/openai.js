// ============================================================
// OpenAI LLM Provider
// Uses OpenAI's standard chat completions endpoint.
// ============================================================

const OPENAI_API_BASE = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

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

        const sliced = filtered.length > 15 ? filtered.slice(-15) : filtered;
        messages.push(...sliced);
    }

    messages.push({ role: 'user', content: message });
    return messages;
}

export async function chatStream({ message, history, systemInstruction, res }) {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
        throw new Error('OpenAI API anahtarı tanımlı değil.');
    }

    const messages = buildMessages(message, history, systemInstruction);

    const response = await fetch(OPENAI_API_BASE, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${openaiKey}`,
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
        throw new Error(`OpenAI API Hatası (${response.status}): ${errBody}`);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

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
                // Ignore parse errors
            }
        }
    }

    res.end();
}

export async function chatComplete({ message, systemInstruction }) {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
        throw new Error('OpenAI API anahtarı tanımlı değil.');
    }

    const messages = buildMessages(message, null, systemInstruction);

    const response = await fetch(OPENAI_API_BASE, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${openaiKey}`,
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
        throw new Error(`OpenAI API Hatası (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

export const providerName = 'openai';

export function isAvailable() {
    return !!process.env.OPENAI_API_KEY;
}
