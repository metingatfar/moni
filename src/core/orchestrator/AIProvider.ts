export interface ModelLimit {
  maxInputTokens: number;
  maxOutputTokens: number;
}

export interface AIProviderMetadata {
  name: string;
  version: string;
  availability: 'online' | 'offline' | 'local';
  limits: ModelLimit;
  status: 'active' | 'inactive';
}

export interface AIProvider {
  metadata: AIProviderMetadata;
  getCapabilities(): Record<string, number>;
}
