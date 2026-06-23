export interface Experience {
  id: string;
  userInput: string;
  strategyUsed: string; // e.g. plan name, tool selected, direct response
  toolsUsed: string[];
  response: string;
  userFeedback?: 'like' | 'dislike' | 'none';
  feedbackText?: string;
  timestamp: string;
}

export class ExperienceCollector {
  private experiences: Experience[] = [];

  public addExperience(exp: Omit<Experience, 'id' | 'timestamp'>): Experience {
    const newExp: Experience = {
      ...exp,
      id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString()
    };
    this.experiences.push(newExp);
    return newExp;
  }

  public getExperiences(): Experience[] {
    return this.experiences;
  }

  public getExperience(id: string): Experience | undefined {
    return this.experiences.find(e => e.id === id);
  }

  public updateFeedback(id: string, feedback: 'like' | 'dislike', feedbackText?: string): void {
    const exp = this.getExperience(id);
    if (exp) {
      exp.userFeedback = feedback;
      if (feedbackText) {
        exp.feedbackText = feedbackText;
      }
    }
  }
}
