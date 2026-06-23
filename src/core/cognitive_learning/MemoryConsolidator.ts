import { container } from '../container/ServiceContainer';
import type { Experience } from './ExperienceCollector';

export interface ConsolidatedFact {
  fact: string;
  category: string;
  consolidated: boolean;
}

export class MemoryConsolidator {
  /**
   * Consolidate temporary facts to long term memory if verified and confirmed by user feedback
   */
  public consolidate(exp: Experience, outcome: string): ConsolidatedFact | undefined {
    // Only consolidate if user gave positive feedback and outcome is successful
    if (exp.userFeedback !== 'like' || outcome !== 'success') return undefined;

    const lowerInput = exp.userInput.toLowerCase();
    const lowerResponse = exp.response.toLowerCase();

    let fact = '';
    let category = 'custom';

    if (lowerInput.includes('fithayat') && lowerResponse.includes('başarıyla')) {
      fact = 'FitHayat projesinde yeni geliştirme planı başarıyla oluşturuldu.';
      category = 'work';
    } else if (lowerInput.includes('badminton') || lowerInput.includes('atıcılık')) {
      fact = 'Metin GATFAR badminton ve atıcılık aktivitelerini düzenli takip ediyor.';
      category = 'sport';
    }

    if (fact) {
      try {
        const ltm = container.resolve<any>('LongTermMemory');
        if (ltm) {
          ltm.addFact(fact, category, 0.9, 'implicit', 3);
          console.log(`[MemoryConsolidator] Consolidated fact to LongTermMemory: ${fact}`);
        }
      } catch (_) {}

      return {
        fact,
        category,
        consolidated: true
      };
    }

    return undefined;
  }
}
