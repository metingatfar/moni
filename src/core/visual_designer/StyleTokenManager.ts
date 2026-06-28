export interface StyleToken {
  category: 'color' | 'typography' | 'radius' | 'spacing' | 'elevation' | 'border';
  name: string;
  value: string;
}

export class StyleTokenManager {
  private tokens: StyleToken[] = [
    { category: 'color', name: 'primary', value: '#6366f1' },
    { category: 'color', name: 'background', value: '#0f172a' },
    { category: 'radius', name: 'md', value: '8px' },
    { category: 'spacing', name: 'md', value: '16px' },
    { category: 'elevation', name: 'card', value: '0 4px 6px rgba(0,0,0,0.15)' }
  ];

  public getTokens(): StyleToken[] {
    return this.tokens;
  }

  public getByCategory(category: StyleToken['category']): StyleToken[] {
    return this.tokens.filter(t => t.category === category);
  }

  public registerToken(token: StyleToken): void {
    const idx = this.tokens.findIndex(t => t.category === token.category && t.name === token.name);
    if (idx >= 0) {
      this.tokens[idx] = token;
    } else {
      this.tokens.push(token);
    }
  }
}
