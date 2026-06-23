import type { LifeModel } from '../life/LifeModel';

export class PredictionEngine {
  public getPredictions(lifeModel: LifeModel): string[] {
    const predictions: string[] = [];
    const metrics = lifeModel.getMetrics();
    const snapshot = lifeModel.getSnapshot();

    // 1. Goal timeline prediction
    if (snapshot.activeGoalsCount > 0 && metrics.goalProgressScore < 40) {
      predictions.push("Mevcut temponuz devam ederse, hedeflerinize ulaşmanız planlanandan biraz daha uzun sürebilir.");
    }

    // 2. Activity trend prediction
    if (metrics.activityScore < 50) {
      predictions.push("Son dönemdeki hareket trendinize bakılırsa, bu haftaki spor hedefinize ulaşmanız güçleşebilir.");
    }

    // 3. Task overload prediction
    if (snapshot.todayTasksCount > 4) {
      predictions.push("Bugünkü yüksek görev yoğunluğu nedeniyle gün sonunda odaklanma ve verimlilik kaybı yaşanabilir.");
    }

    // Fallbacks
    if (predictions.length === 0) {
      predictions.push("Düzenli takibiniz sayesinde önümüzdeki günlerin verimli geçeceği öngörülüyor.");
    }

    return predictions;
  }
}
