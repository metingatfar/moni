import { personalityEngine } from '../personality/PersonalityEngine';
import type { EmotionalContext } from '../personality/PersonalityEngine';

export class PromptBuilder {
  /**
   * Builds the system instruction using PersonalityEngine.
   * If customInstruction is provided, it is appended as additional context.
   */
  public static buildSystemInstruction(
    customInstruction?: string,
    userName?: string,
    emotionalContext?: EmotionalContext | null
  ): string {
    const personalityPrompt = personalityEngine.getSystemPrompt(userName, emotionalContext);

    if (customInstruction) {
      return personalityPrompt + '\n\n' + customInstruction;
    }

    return personalityPrompt;
  }

  public static buildUserPrompt(rawInput: string): string {
    return rawInput.trim();
  }
}

