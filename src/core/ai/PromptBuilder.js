import { personalityEngine } from '../personality/PersonalityEngine';
export class PromptBuilder {
    /**
     * Builds the system instruction using PersonalityEngine.
     * If customInstruction is provided, it is appended as additional context.
     */
    static buildSystemInstruction(customInstruction, userName, emotionalContext) {
        const personalityPrompt = personalityEngine.getSystemPrompt(userName, emotionalContext);
        if (customInstruction) {
            return personalityPrompt + '\n\n' + customInstruction;
        }
        return personalityPrompt;
    }
    static buildUserPrompt(rawInput) {
        return rawInput.trim();
    }
}
