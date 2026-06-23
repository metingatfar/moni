import type { Experience } from './ExperienceCollector';

export interface UserPreferences {
  responseLength: 'short' | 'detailed' | 'normal';
  style: 'formal' | 'casual' | 'technical';
  scores: {
    shortScore: number;
    detailedScore: number;
    formalScore: number;
    technicalScore: number;
  };
}

export class PreferenceLearner {
  private prefs: UserPreferences = {
    responseLength: 'normal',
    style: 'casual',
    scores: {
      shortScore: 0,
      detailedScore: 0,
      formalScore: 0,
      technicalScore: 0
    }
  };

  public learnPreferences(exp: Experience): void {
    const text = exp.userInput.toLowerCase();

    // Check for explicit commands
    if (text.includes('kısa cevap') || text.includes('kısa yaz') || text.includes('kisa')) {
      this.prefs.scores.shortScore += 5;
      this.prefs.scores.detailedScore = Math.max(0, this.prefs.scores.detailedScore - 2);
    } else if (text.includes('detaylı') || text.includes('rapor') || text.includes('uzun')) {
      this.prefs.scores.detailedScore += 5;
      this.prefs.scores.shortScore = Math.max(0, this.prefs.scores.shortScore - 2);
    }

    if (text.includes('resmi') || text.includes('ciddi')) {
      this.prefs.scores.formalScore += 5;
      this.prefs.scores.technicalScore = Math.max(0, this.prefs.scores.technicalScore - 2);
    } else if (text.includes('teknik') || text.includes('kod') || text.includes('şartname')) {
      this.prefs.scores.technicalScore += 5;
      this.prefs.scores.formalScore = Math.max(0, this.prefs.scores.formalScore - 2);
    }

    // Resolve preference properties
    if (this.prefs.scores.shortScore > this.prefs.scores.detailedScore && this.prefs.scores.shortScore >= 5) {
      this.prefs.responseLength = 'short';
    } else if (this.prefs.scores.detailedScore > this.prefs.scores.shortScore && this.prefs.scores.detailedScore >= 5) {
      this.prefs.responseLength = 'detailed';
    } else {
      this.prefs.responseLength = 'normal';
    }

    if (this.prefs.scores.technicalScore > this.prefs.scores.formalScore && this.prefs.scores.technicalScore >= 5) {
      this.prefs.style = 'technical';
    } else if (this.prefs.scores.formalScore > this.prefs.scores.technicalScore && this.prefs.scores.formalScore >= 5) {
      this.prefs.style = 'formal';
    } else {
      this.prefs.style = 'casual';
    }
  }

  public getPreferences(): UserPreferences {
    return this.prefs;
  }
}
