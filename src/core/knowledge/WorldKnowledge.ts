export interface WorldFact {
  topic: string;
  category: 'sport' | 'software' | 'health' | 'nutrition' | 'general';
  description: string;
  reliability: number;
}

export class WorldKnowledge {
  private worldFacts: Map<string, WorldFact> = new Map();

  constructor() {
    this.initDefaultWorld();
  }

  private initDefaultWorld() {
    this.worldFacts.set('badminton', {
      topic: 'Badminton',
      category: 'sport',
      description: 'Badminton, tüylü bir top ve raketlerle oynanan, hız ve refleks gerektiren Olimpik bir spordur.',
      reliability: 0.98
    });

    this.worldFacts.set('fithayat', {
      topic: 'FitHayat',
      category: 'health',
      description: 'FitHayat, kullanıcıların beslenme, spor aktiviteleri ve kalori takibi yapmalarını sağlayan bir sağlık platformudur.',
      reliability: 0.95
    });

    this.worldFacts.set('react', {
      topic: 'React',
      category: 'software',
      description: 'React, web arayüzleri oluşturmak için kullanılan popüler bir JavaScript kütüphanesidir.',
      reliability: 0.99
    });
  }

  public getTopicInfo(topic: string): WorldFact | undefined {
    return this.worldFacts.get(topic.toLowerCase().trim());
  }

  public learnWorldFact(topic: string, category: WorldFact['category'], description: string, reliability = 0.8): void {
    this.worldFacts.set(topic.toLowerCase().trim(), {
      topic,
      category,
      description,
      reliability
    });
  }

  public getAllWorldFacts(): WorldFact[] {
    return Array.from(this.worldFacts.values());
  }
}
