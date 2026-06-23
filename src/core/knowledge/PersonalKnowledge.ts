import { container } from '../container/ServiceContainer';
import { OWNER_PROFILE } from '../../config/ownerProfile';

export interface PersonalFact {
  key: string;
  value: string;
  category: string;
  updatedAt: string;
}

export class PersonalKnowledge {
  private facts: Map<string, PersonalFact> = new Map();

  constructor() {
    this.syncWithMemory();
  }

  public syncWithMemory(): void {
    // 1. Populate default values
    this.facts.set('identity', {
      key: 'identity',
      value: `Adı ${OWNER_PROFILE.ownerName}, Mesleği Spor Şube Müdürü`,
      category: 'identity',
      updatedAt: new Date().toISOString()
    });
    this.facts.set('sport', {
      key: 'sport',
      value: `İlgi alanları Badminton, Atıcılık`,
      category: 'sport',
      updatedAt: new Date().toISOString()
    });
    this.facts.set('location', {
      key: 'location',
      value: `Konum: Bolu, Türkiye`,
      category: 'location',
      updatedAt: new Date().toISOString()
    });

    // 2. Read long-term memory facts if available
    try {
      const ltm = container.resolve<any>('LongTermMemory');
      if (ltm) {
        const stored = ltm.getFacts() || [];
        for (const item of stored) {
          const key = item.category || 'general';
          const content = item.content || item;
          if (typeof content === 'string') {
            // Discard/filter out invalid names/fallbacks
            if (
              content.includes('Ahmet') || 
              content.includes('Mehmet') || 
              content.toLowerCase().includes('default user') || 
              content.toLowerCase().includes('generic user') ||
              content.toLowerCase().includes('test user')
            ) {
              continue;
            }
          }

          // OwnerProfile identity takes absolute priority over memory
          if (key === 'identity') {
            continue;
          }

          this.facts.set(key, {
            key,
            value: content,
            category: key,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (_) {}
  }

  public getFact(key: string): PersonalFact | undefined {
    this.syncWithMemory();
    return this.facts.get(key);
  }

  public getAllFacts(): PersonalFact[] {
    this.syncWithMemory();
    return Array.from(this.facts.values());
  }

  public learnFact(category: string, value: string): void {
    this.facts.set(category, {
      key: category,
      value,
      category,
      updatedAt: new Date().toISOString()
    });
  }
}
