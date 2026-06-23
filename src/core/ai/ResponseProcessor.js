export class ResponseProcessor {
    /**
     * Cleans markdown formatting, bold tags, asterisk characters, list indicators,
     * and other symbols that make TTS engine readouts sound awkward.
     */
    static sanitizeForSpeech(text) {
        if (!text)
            return '';
        let cleanText = text;
        // Remove markdown bold markings
        cleanText = cleanText.replace(/\*\*/g, '');
        // Remove italic markings
        cleanText = cleanText.replace(/\*/g, '');
        // Remove list bullet signs
        cleanText = cleanText.replace(/^[\s]*[-*+][\s]+/gm, '');
        // Remove heading marks
        cleanText = cleanText.replace(/^[\s]*#+[\s]+/gm, '');
        // Clean code blocks
        cleanText = cleanText.replace(/```[\s\S]*?```/g, '');
        cleanText = cleanText.replace(/`([^`]+)`/g, '$1');
        // Clean emojis if they might confuse the TTS (optional, let's keep them moderate)
        // For now, clean out parentheses containing technical details
        cleanText = cleanText.replace(/\(([^)]+)\)/g, (_, content) => {
            // If it contains only digits/dates, keep it. If it contains words, we can keep or drop.
            return content;
        });
        return cleanText.trim();
    }
    /**
     * Parses JSON responses or extracts metadata if needed.
     */
    static parseJsonSafely(text, fallback) {
        try {
            // Find the JSON block if it is wrapped in markdown
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return JSON.parse(text);
        }
        catch (_) {
            return fallback;
        }
    }
}
