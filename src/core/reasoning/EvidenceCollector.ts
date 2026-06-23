import { container } from '../container/ServiceContainer';

export interface Evidence {
  source: string;
  fact: string;
  reliability: number; // 0 to 1.0
}

export class EvidenceCollector {
  public collectEvidence(input: string): Evidence[] {
    const list: Evidence[] = [];

    // 1. Search LongTermMemory (Read-Only)
    try {
      const ltm = container.resolve<any>('LongTermMemory');
      if (ltm) {
        const facts = ltm.search(input);
        for (const f of facts) {
          list.push({
            source: 'LongTermMemory',
            fact: f,
            reliability: 0.95
          });
        }
      }
    } catch (_) {}

    // 2. Search LifeModel (Read-Only)
    try {
      const lm = container.resolve<any>('LifeModel');
      if (lm) {
        const snapshot = lm.getSnapshot();
        list.push({
          source: 'LifeModel',
          fact: `Sağlık Skoru: ${lm.getMetrics()?.healthScore || 85}/100, Aktif Hedefler: ${snapshot.activeGoalsCount || 0}`,
          reliability: 0.9
        });
      }
    } catch (_) {}

    // 3. Search GoalEngine (Read-Only)
    try {
      const ge = container.resolve<any>('GoalEngine');
      if (ge) {
        const activeGoals = ge.getGoals().filter((g: any) => g.status === 'active');
        for (const goal of activeGoals) {
          list.push({
            source: 'GoalEngine',
            fact: `Aktif Hedef: ${goal.title} (İlerleme: %${goal.progress})`,
            reliability: 0.92
          });
        }
      }
    } catch (_) {}

    // Add generic fallback evidence if none found to ensure system reasoning runs
    if (list.length === 0) {
      list.push({
        source: 'SystemContext',
        fact: 'Kullanıcı talebi için yerel veritabanında doğrudan çakışan veya eşleşen bir kısıt bulunamadı.',
        reliability: 0.8
      });
    }

    return list;
  }
}
