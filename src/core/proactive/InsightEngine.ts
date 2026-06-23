import type { LifeModel } from '../life/LifeModel';

export class InsightEngine {
  public getInsights(lifeModel: LifeModel): string[] {
    const insights: string[] = [];
    const snapshot = lifeModel.getSnapshot();
    const profile = lifeModel.getProfile();

    // 1. Sport logs check
    if (snapshot.lastSportDate) {
      const lastSport = new Date(snapshot.lastSportDate);
      const diffDays = (Date.now() - lastSport.getTime()) / (1000 * 3600 * 24);
      if (diffDays > 3) {
        insights.push(`Son spor kaydınızın üzerinden ${Math.floor(diffDays)} gün geçmiş görünüyor.`);
      }
    } else {
      insights.push("Henüz kaydedilmiş bir spor aktiviteniz bulunmuyor.");
    }

    // 2. Weight goal and tracking check
    const hasWeightGoal = profile.goals.activeGoals.some(g => g.toLowerCase().includes('kilo'));
    if (hasWeightGoal && !snapshot.lastWeight) {
      insights.push("Kilo verme hedefiniz var fakat henüz güncel bir kilo ölçümü girmemiş görünüyorsunuz.");
    }

    // 3. Conversation indicators (e.g. fatigue)
    if (snapshot.lastConversationTopic === 'health') {
      insights.push("Son konuşmalarınızda sağlık konuları ön plandaydı, kendinize dikkat etmeniz önemli görünüyor.");
    }

    // 4. Project status check
    const workMemories = profile.projects.length;
    if (workMemories > 0) {
      insights.push(`Mevcut aktif ${workMemories} projeniz üzerinde çalışmaya devam ediyorsunuz.`);
    }

    return insights;
  }
}
