export interface EditorSuggestion {
  line: number;
  text: string;
  type: 'info' | 'warning' | 'heal';
}

export class EditorManager {
  private suggestions: EditorSuggestion[] = [];

  public getLanguageForFile(filePath: string): string {
    const ext = filePath.split('.').pop() || '';
    if (ext === 'ts' || ext === 'tsx') return 'typescript';
    if (ext === 'js' || ext === 'jsx') return 'javascript';
    if (ext === 'css') return 'css';
    if (ext === 'html') return 'html';
    if (ext === 'md') return 'markdown';
    return 'plaintext';
  }

  public getSuggestions(): EditorSuggestion[] {
    return this.suggestions;
  }

  public addSuggestion(suggestion: EditorSuggestion): void {
    this.suggestions.push(suggestion);
  }

  public clearSuggestions(): void {
    this.suggestions = [];
  }
}
