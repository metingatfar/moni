import type { MemoryFact } from './LongTermMemory';

export class MemoryIndex {
  private index: Map<string, Set<MemoryFact>> = new Map();

  public indexFact(fact: MemoryFact): void {
    const tokens = fact.content.toLowerCase().split(/\s+/);
    for (const token of tokens) {
      if (token.length < 3) continue; // Skip very short words
      if (!this.index.has(token)) {
        this.index.set(token, new Set());
      }
      this.index.get(token)!.add(fact);
    }
  }

  public search(query: string): Set<MemoryFact> {
    const results = new Set<MemoryFact>();
    const tokens = query.toLowerCase().split(/\s+/);
    for (const token of tokens) {
      const matches = this.index.get(token);
      if (matches) {
        for (const fact of matches) {
          results.add(fact);
        }
      }
    }
    return results;
  }
}
