import type { Experience } from './ExperienceCollector';

export class PatternMiner {
  private patterns: Map<string, number> = new Map();

  public minePattern(exp: Experience): void {
    const text = exp.userInput.toLowerCase();

    // Map common keywords to high-level subject patterns
    if (text.includes('fithayat') || text.includes('diyet') || text.includes('kalori') || text.includes('beslenme')) {
      this.incrementPattern('FitHayat & Sağlık');
    }
    if (text.includes('spor') || text.includes('badminton') || text.includes('aticilik') || text.includes('atıcılık')) {
      this.incrementPattern('Spor & Aktiviteler');
    }
    if (text.includes('plan') || text.includes('hedef') || text.includes('sprint') || text.includes('proje')) {
      this.incrementPattern('Proje & Planlama');
    }
    if (text.includes('şartname') || text.includes('sartname') || text.includes('resmi') || text.includes('belge')) {
      this.incrementPattern('Resmi Evrak & Yazışma');
    }
  }

  private incrementPattern(patternName: string): void {
    const count = this.patterns.get(patternName) || 0;
    this.patterns.set(patternName, count + 1);
  }

  public getLearnedPatterns(): { pattern: string; count: number }[] {
    return Array.from(this.patterns.entries())
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count);
  }
}
