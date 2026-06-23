export interface GoalRecommendation {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  reason: string;
}

export class GoalRecommendationEngine {
  public generateRecommendations(lifeSnapshot: any, memoryFacts: any[]): GoalRecommendation[] {
    const recommendations: GoalRecommendation[] = [];

    // Analyze memory facts to see if user has been studying languages
    const studyEnglishFact = memoryFacts.find(f => f.content.toLowerCase().includes('ingilizce') || f.content.toLowerCase().includes('english'));
    
    if (studyEnglishFact) {
      recommendations.push({
        title: "Haftada 5 gün 20 dakika İngilizce çalışmak",
        description: "Düzenli dil pratiğiyle İngilizce seviyenizi geliştirmeyi amaçlar.",
        category: "learning",
        priority: "medium",
        reason: "İngilizce çalışma hedeflerinizi uzun süredir takip ettiğiniz için bu düzenli hedefi oluşturmak iyi bir adım olabilir."
      });
    }

    // Health recommendation based on weight or activity score
    const activityScore = lifeSnapshot.activityScore || 80;
    if (activityScore < 70) {
      recommendations.push({
        title: "Haftada 3 gün 30 dakika yürüyüş",
        description: "Genel kondisyonu ve aktivite skorunu artırmak amacıyla planlanmış yürüyüşler.",
        category: "fitness",
        priority: "high",
        reason: "Aktivite seviyenizi desteklemek ve genel yaşam kalitenizi artırmak için bu hedef faydalı olabilir."
      });
    }

    // Default general recommendation if list is empty
    if (recommendations.length === 0) {
      recommendations.push({
        title: "Kitap okuma rutini oluşturmak",
        description: "Her gün 15 sayfa kitap okuma alışkanlığı edinmek.",
        category: "learning",
        priority: "low",
        reason: "Zihinsel zindeliği korumak için yeni bir rutin faydalı olabilir."
      });
    }

    return recommendations;
  }
}
