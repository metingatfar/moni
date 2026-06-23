// ============================================================
// Gemini LLM Provider
// Uses @google/generative-ai SDK for streaming and completion.
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_MODEL = 'gemini-2.5-flash';

/**
 * @param {object} options
 * @param {string} options.message - User message
 * @param {Array} [options.history] - Chat history
 * @param {string} [options.systemInstruction] - System prompt
 * @param {string} [options.apiKey] - Dynamic API key override
 * @param {import('express').Response} options.res - Express response for SSE
 */
export async function chatStream({ message, history, systemInstruction, res }) {
    const activeKey = process.env.GEMINI_API_KEY;
    if (!activeKey) {
        throw new Error('Gemini API anahtarı tanımlı değil.');
    }

    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({
        model: DEFAULT_MODEL,
        systemInstruction: systemInstruction || undefined
    });

    let contents = [];
    if (history && Array.isArray(history)) {
        contents = history
            .filter(m => m.content && m.content.trim() !== '' && m.role !== 'system')
            .map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));
    }

    contents.push({ role: 'user', parts: [{ text: message }] });

    if (contents.length > 15) {
        contents = contents.slice(-15);
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const result = await model.generateContentStream({ contents });

    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
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
    const activeKey = process.env.GEMINI_API_KEY;
    if (!activeKey) {
        throw new Error('Gemini API anahtarı tanımlı değil.');
    }

    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({
        model: DEFAULT_MODEL,
        systemInstruction: systemInstruction || undefined
    });

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: message }] }]
    });

    return result.response.text();
}

export const providerName = 'gemini';

export function isAvailable() {
    return !!process.env.GEMINI_API_KEY;
}
