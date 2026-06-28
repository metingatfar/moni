export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export interface GeneratedTheme {
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  borderRadius: string;
  boxShadow: string;
}

export class ThemeEngine {
  public generateTheme(themeName: string, mode: 'light' | 'dark'): GeneratedTheme {
    const isDark = mode === 'dark';
    const cleanTheme = themeName.toLowerCase();

    // Default palette values
    let colors: ThemeColors = {
      background: isDark ? '#0f172a' : '#f8fafc',
      surface: isDark ? '#1e293b' : '#ffffff',
      primary: '#6366f1',
      secondary: '#64748b',
      accent: '#ec4899',
      textPrimary: isDark ? '#f8fafc' : '#0f172a',
      textSecondary: isDark ? '#94a3b8' : '#475569',
      border: isDark ? '#334155' : '#e2e8f0'
    };

    if (cleanTheme.includes('fitness')) {
      colors.primary = '#f97316'; // Orange energy
      colors.accent = '#22c55e'; // Green wellness
    } else if (cleanTheme.includes('medical')) {
      colors.primary = '#06b6d4'; // Cyan healing
      colors.accent = '#3b82f6'; // Blue trust
    } else if (cleanTheme.includes('corporate')) {
      colors.primary = '#1e3a8a'; // Deep Navy corporate
      colors.accent = '#ffd700'; // Gold high status
    } else if (cleanTheme.includes('ai')) {
      colors.primary = '#8b5cf6'; // Purple intelligence
      colors.accent = '#06b6d4'; // Cyan tech
    }

    return {
      name: themeName,
      mode,
      colors,
      borderRadius: '8px',
      boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.05)'
    };
  }
}
