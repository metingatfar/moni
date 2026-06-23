export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface LLMRequestOptions {
  message: string;
  history?: ChatMessage[];
  systemInstruction?: string;
  provider?: 'gemini' | 'groq';
  apiKey?: string;
}

export interface LLMProvider {
  name: 'gemini' | 'groq';
  isAvailable(): boolean;
  chatComplete(options: LLMRequestOptions): Promise<string>;
  chatStream(
    options: LLMRequestOptions,
    onChunk: (chunk: string) => void
  ): Promise<void>;
}
