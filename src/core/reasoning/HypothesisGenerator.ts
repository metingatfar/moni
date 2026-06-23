export interface Hypothesis {
  id: string;
  meaning: string;
  initialConfidence: number; // 0 to 1.0
  intentType: string;
}

export class HypothesisGenerator {
  public generateHypotheses(input: string): Hypothesis[] {
    const lower = input.toLowerCase().trim();
    const list: Hypothesis[] = [];

    if (lower.includes('fithayat')) {
      list.push({
        id: 'hyp-1',
        meaning: 'FitHayat projesi için yazılım mimarisi ve altyapı geliştirme.',
        initialConfidence: 0.85,
        intentType: 'project_planning'
      });
      list.push({
        id: 'hyp-2',
        meaning: 'FitHayat kapsamında kullanıcı egzersiz ve diyet rutinlerini optimize etme.',
        initialConfidence: 0.65,
        intentType: 'life_model_optimization'
      });
      list.push({
        id: 'hyp-3',
        meaning: 'FitHayat marka veya pazar araştırmasını internette araştırma.',
        initialConfidence: 0.45,
        intentType: 'research'
      });
      return list;
    }

    if (lower.includes('badminton')) {
      list.push({
        id: 'hyp-1',
        meaning: 'Yarınki badminton aktivitesi için spor çantası hazırlama.',
        initialConfidence: 0.9,
        intentType: 'checklist_reminder'
      });
      list.push({
        id: 'hyp-2',
        meaning: 'Badminton oynamak için takvime etkinlik ekleme.',
        initialConfidence: 0.7,
        intentType: 'calendar'
      });
      return list;
    }

    // Default hypotheses
    list.push({
      id: 'hyp-default-1',
      meaning: `Girdi hakkında genel asistan sohbeti yürütülmesi: "${input}"`,
      initialConfidence: 0.6,
      intentType: 'general_chat'
    });

    return list;
  }
}
