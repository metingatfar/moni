export interface MoniThemeColors {
  background: string;
  sidebarBackground: string;
  accentColor: string;
  textColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
}

export class ThemeEvolutionEngine {
  private themes: Record<string, MoniThemeColors> = {
    dark: {
      background: '#121212',
      sidebarBackground: '#1e1e1e',
      accentColor: '#9333ea', // purple
      textColor: '#e5e7eb',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444'
    },
    light: {
      background: '#f3f4f6',
      sidebarBackground: '#ffffff',
      accentColor: '#4f46e5',
      textColor: '#1f2937',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444'
    },
    midnight: {
      background: '#090d16',
      sidebarBackground: '#0b132b',
      accentColor: '#00b4d8',
      textColor: '#ffffff',
      successColor: '#06d6a0',
      warningColor: '#ffd166',
      errorColor: '#ef476f'
    },
    graphite: {
      background: '#1c1c1c',
      sidebarBackground: '#262626',
      accentColor: '#8a2be2',
      textColor: '#d4d4d4',
      successColor: '#2e8b57',
      warningColor: '#ff8c00',
      errorColor: '#cd5c5c'
    }
  };

  public getTheme(name: string): MoniThemeColors {
    return this.themes[name.toLowerCase()] || this.themes.dark;
  }

  public getSupportedThemes(): string[] {
    return Object.keys(this.themes);
  }
}
export const themeEvolutionEngine = new ThemeEvolutionEngine();
export default themeEvolutionEngine;
