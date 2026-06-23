import type { LifeModel } from '../life/LifeModel';
import { stateManager } from '../state/StateManager';

export class RiskEngine {
  public getRisks(lifeModel: LifeModel): string[] {
    const risks: string[] = [];
    const snapshot = lifeModel.getSnapshot();
    const profile = lifeModel.getProfile();
    const diagState = stateManager.getState();

    // 1. Health check-in risk
    const hasHealthMed = profile.health.medications.length > 0 || profile.health.conditions.length > 0;
    if (hasHealthMed && !snapshot.lastWeight && !snapshot.lastBP) {
      risks.push("Son dönemde güncel sağlık verilerinizi girmediğiniz tespit edildi, küçük kontrolleri aksatmamak iyi olabilir.");
    }

    // 2. Overdue or pending task warnings
    if (snapshot.todayTasksCount > 0 && snapshot.upcomingMeetings.length > 0) {
      // High load warning
      risks.push("Yaklaşan toplantılar ve tamamlanmamış görevler çakışabilir, zaman planlamasına dikkat etmek yararlı olabilir.");
    }

    // 3. System quality warning
    if (diagState.legacyFallbackCount > 3) {
      risks.push("Yapay zeka servislerinde geçici bağlantı/performans dalgalanmaları tespit edildi, cevap süreleri gecikebilir.");
    }

    // 4. General wellness checks (Strictly avoiding medical diagnoses)
    if (snapshot.lastConversationTopic === 'health') {
      risks.push("Son konuşmalarınızda yorgunluk ve sağlık ifadeleri gözlendi, dinlenmeye vakit ayırmanız tavsiye edilebilir. Ciddi şikayetlerinizde hekiminize danışmayı unutmayın.");
    }

    return risks;
  }
}
