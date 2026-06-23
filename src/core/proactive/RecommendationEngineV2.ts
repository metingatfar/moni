import type { LifeModel } from '../life/LifeModel';

export class RecommendationEngineV2 {
  public getRecommendations(lifeModel: LifeModel): string[] {
    const recommendations: string[] = [];
    const snapshot = lifeModel.getSnapshot();
    const metrics = lifeModel.getMetrics();

    // 1. General health recommendation
    if (metrics.healthScore < 75) {
      recommendations.push("Bugün hafif tempolu 20 dakikalık bir yürüyüş yapmak ve bol su içmek iyi gelebilir.");
    }

    // 2. Goal-based sport adjustment
    if (snapshot.activeGoalsCount > 0 && snapshot.todayTasksCount > 3) {
      recommendations.push("İş yoğunluğunuz yüksek görünüyor, bugünkü antrenmanı hafif tutmanız iyi bir fikir olabilir.");
    } else if (metrics.activityScore < 60) {
      recommendations.push("Haftalık hareketliliğinizi artırmak adına bugün kısa bir esneme seansı planlayabilirsiniz.");
    }

    // 3. Routines & preferences check
    if (snapshot.upcomingMeetings.length > 2) {
      recommendations.push("Toplantı yoğunluğunuz fazla. Ara dinlenmelerde zihninizi rahatlatacak kısa nefes egzersizleri yapabilirsiniz.");
    }

    // Default fallbacks if recommendations are too few
    if (recommendations.length === 0) {
      recommendations.push("Günlük rutininizi korumaya ve düzenli su tüketmeye özen gösterin.");
      recommendations.push("Bugün hedeflerinize odaklanmak için harika bir gün.");
    }

    return recommendations;
  }
}
