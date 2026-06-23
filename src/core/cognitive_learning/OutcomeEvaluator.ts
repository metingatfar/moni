import type { Experience } from './ExperienceCollector';

export type OutcomeResult = 'success' | 'failure' | 'rejected' | 'incomplete';

export class OutcomeEvaluator {
  public evaluate(exp: Experience): OutcomeResult {
    // 1. Explicit feedback check
    if (exp.userFeedback === 'dislike') {
      if (exp.feedbackText?.toLowerCase().includes('red') || exp.feedbackText?.toLowerCase().includes('iptal')) {
        return 'rejected';
      }
      return 'failure';
    }
    if (exp.userFeedback === 'like') {
      return 'success';
    }

    // 2. Text heuristics check
    const lowerInput = exp.userInput.toLowerCase();
    const lowerResponse = exp.response.toLowerCase();

    if (
      lowerInput.includes('iptal') || 
      lowerResponse.includes('iptal ettim') || 
      lowerResponse.includes('kayıt oluşturulmadı')
    ) {
      return 'rejected';
    }

    if (
      lowerResponse.includes('hata oluştu') || 
      lowerResponse.includes('failed') || 
      lowerResponse.includes('error')
    ) {
      return 'failure';
    }

    if (
      lowerResponse.includes('netleştiremedim') || 
      lowerResponse.includes('belirtilmedi') || 
      lowerResponse.includes('eksik')
    ) {
      return 'incomplete';
    }

    return 'success';
  }
}
