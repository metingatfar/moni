export class PromptOptimizer {
  private static instance: PromptOptimizer;

  private constructor() {}

  public static getInstance(): PromptOptimizer {
    if (!PromptOptimizer.instance) {
      PromptOptimizer.instance = new PromptOptimizer();
    }
    return PromptOptimizer.instance;
  }

  /**
   * Trims the chat history to keep only the last 5 relevant messages,
   * reducing token footprint and preventing context bloat.
   */
  public optimizeHistory(history: any[]): any[] {
    if (!history || !Array.isArray(history)) return [];
    
    // Filter out system instructions or blank messages
    const cleanHistory = history.filter(
      m => m.content && m.content.trim() !== '' && m.role !== 'system'
    );

    // Keep only the last 5 messages
    return cleanHistory.length > 5 ? cleanHistory.slice(-5) : cleanHistory;
  }

  /**
   * Summarizes long list of user memory records into a single short text token payload.
   */
  public summarizeMemory(memories: any[]): string {
    if (!memories || !Array.isArray(memories) || memories.length === 0) {
      return '';
    }

    // Keep only name, preferences, and important facts to conserve token budget
    const relevant = memories.filter(
      m => m.category === 'name' || m.category === 'preferences' || m.category === 'projects'
    );

    if (relevant.length === 0) {
      // Pick first 3 elements as fallback
      return memories.slice(0, 3).map(m => `${m.category}: ${m.content}`).join(', ');
    }

    return relevant.map(m => `${m.category}: ${m.content}`).join(', ');
  }

  /**
   * Strips out verbose UI, diagnostics, or report payloads from outgoing context objects.
   */
  public sanitizePayload(payload: any): any {
    if (!payload || typeof payload !== 'object') return payload;

    const copy = { ...payload };

    // Delete heavy/redundant fields
    delete copy.diagnostics;
    delete copy.systemLogs;
    delete copy.visualThemeData;
    delete copy.activeReports;

    return copy;
  }
}

export const promptOptimizer = PromptOptimizer.getInstance();
export default promptOptimizer;
