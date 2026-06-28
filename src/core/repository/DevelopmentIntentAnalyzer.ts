export type DevelopmentIntent = 'Feature' | 'BugFix' | 'Refactor' | 'Optimization' | 'Documentation' | 'Testing' | 'Architecture' | 'UI';

export class DevelopmentIntentAnalyzer {
  public analyzeIntent(requestText: string): DevelopmentIntent {
    const lower = requestText.toLowerCase();
    if (lower.includes('fix') || lower.includes('bug') || lower.includes('hata')) {
      return 'BugFix';
    }
    if (lower.includes('refactor') || lower.includes('reorganize') || lower.includes('yeniden yapılandır')) {
      return 'Refactor';
    }
    if (lower.includes('optimize') || lower.includes('hızlandır') || lower.includes('performans')) {
      return 'Optimization';
    }
    if (lower.includes('doc') || lower.includes('documentation') || lower.includes('belge')) {
      return 'Documentation';
    }
    if (lower.includes('test') || lower.includes('suite') || lower.includes('unit')) {
      return 'Testing';
    }
    if (lower.includes('architecture') || lower.includes('design') || lower.includes('mimari')) {
      return 'Architecture';
    }
    if (lower.includes('ui') || lower.includes('css') || lower.includes('style') || lower.includes('görsel')) {
      return 'UI';
    }
    return 'Feature';
  }
}

export const developmentIntentAnalyzer = new DevelopmentIntentAnalyzer();
export default developmentIntentAnalyzer;
