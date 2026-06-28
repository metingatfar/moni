export type CodingIntent = 'feature' | 'bugfix' | 'refactor' | 'optimization' | 'ui' | 'api' | 'database' | 'testing' | 'documentation';

export class CodingIntentAnalyzer {
  public analyzeIntent(goal: string): CodingIntent {
    const lowerGoal = goal.toLowerCase();
    
    if (lowerGoal.includes('fix') || lowerGoal.includes('bug') || lowerGoal.includes('hata')) {
      return 'bugfix';
    }
    if (lowerGoal.includes('refactor') || lowerGoal.includes('yapılandır')) {
      return 'refactor';
    }
    if (lowerGoal.includes('optimize') || lowerGoal.includes('performance') || lowerGoal.includes('hızlandır')) {
      return 'optimization';
    }
    if (lowerGoal.includes('ui') || lowerGoal.includes('screen') || lowerGoal.includes('component') || lowerGoal.includes('ekran') || lowerGoal.includes('bileşen')) {
      return 'ui';
    }
    if (lowerGoal.includes('api') || lowerGoal.includes('endpoint') || lowerGoal.includes('route')) {
      return 'api';
    }
    if (lowerGoal.includes('db') || lowerGoal.includes('database') || lowerGoal.includes('schema') || lowerGoal.includes('veritabanı')) {
      return 'database';
    }
    if (lowerGoal.includes('test') || lowerGoal.includes('unit')) {
      return 'testing';
    }
    if (lowerGoal.includes('document') || lowerGoal.includes('doc') || lowerGoal.includes('belge')) {
      return 'documentation';
    }
    
    return 'feature';
  }
}

export const codingIntentAnalyzer = new CodingIntentAnalyzer();
export default codingIntentAnalyzer;
