export interface CacheEntry {
  promptHash: string;
  response: string;
  savedTokens: number;
}

export class PromptCache {
  private cache: Map<string, CacheEntry> = new Map();
  private hitCount = 0;

  public get(prompt: string): string | undefined {
    const entry = this.cache.get(prompt);
    if (entry) {
      this.hitCount++;
      return entry.response;
    }
    return undefined;
  }

  public set(prompt: string, response: string, tokens: number): void {
    this.cache.set(prompt, {
      promptHash: prompt,
      response,
      savedTokens: tokens
    });
  }

  public getHitRate(): number {
    const total = this.cache.size + this.hitCount;
    if (total === 0) return 0;
    return Math.round((this.hitCount / total) * 100);
  }

  public clear(): void {
    this.cache.clear();
    this.hitCount = 0;
  }
}
