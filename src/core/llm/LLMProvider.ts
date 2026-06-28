export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface RawLLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  providerName: string;
  modelName: string;
}

export interface LLMProvider {
  name: string;
  executeRequest(req: LLMRequest): Promise<RawLLMResponse>;
}
