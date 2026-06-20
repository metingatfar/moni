export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AiRepository {
  /**
   * Generates a text response from the model (online or offline)
   */
  generateResponse(messages: Message[], useOfflineMode: boolean): Promise<string>;

  /**
   * Converts user speech (audio) to text
   */
  speechToText(audioBlob: Blob): Promise<string>;

  /**
   * Converts text response to speech audio
   */
  textToSpeech(text: string): Promise<AudioBuffer | ArrayBuffer>;
}
