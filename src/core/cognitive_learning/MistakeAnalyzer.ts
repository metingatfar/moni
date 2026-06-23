import type { Experience } from './ExperienceCollector';

export interface Mistake {
  id: string;
  category: 'unclear_response' | 'failed_tool' | 'unwanted_format' | 'general';
  description: string;
  timestamp: string;
}

export class MistakeAnalyzer {
  private mistakes: Mistake[] = [];

  public analyzeMistake(exp: Experience): Mistake | undefined {
    if (exp.userFeedback !== 'dislike') return undefined;

    let category: Mistake['category'] = 'general';
    const text = (exp.feedbackText || '').toLowerCase();
    const response = exp.response.toLowerCase();

    if (text.includes('format') || text.includes('dil') || text.includes('uzun') || text.includes('kısa')) {
      category = 'unwanted_format';
    } else if (response.includes('hata') || response.includes('failed') || exp.toolsUsed.length > 0) {
      category = 'failed_tool';
    } else if (text.includes('anlamadım') || text.includes('net değil')) {
      category = 'unclear_response';
    }

    const newMistake: Mistake = {
      id: 'mistake-' + Date.now(),
      category,
      description: exp.feedbackText || 'Kullanıcı cevabı beğenmedi.',
      timestamp: new Date().toISOString()
    };

    this.mistakes.push(newMistake);
    return newMistake;
  }

  public getMistakes(): Mistake[] {
    return this.mistakes;
  }
}
