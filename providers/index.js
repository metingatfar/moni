import * as gemini from './gemini.js';
import * as groq from './groq.js';
import * as openai from './openai.js';

const providers = {
    gemini,
    openai,
    groq
};

export function getProvider(name) {
    const provider = providers[name];
    if (!provider) {
        throw new Error(`Sağlayıcı bulunamadı: ${name}`);
    }
    return provider;
}

export function getAvailableProviders() {
    return Object.keys(providers).filter(name => providers[name].isAvailable());
}

export function getDefaultProvider() {
    const available = getAvailableProviders();
    if (available.includes('gemini')) return 'gemini';
    if (available.length > 0) return available[0];
    return 'gemini'; // default fallback
}
