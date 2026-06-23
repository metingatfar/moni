import type { LifeModel } from '../life/LifeModel';

export class WeeklyReviewGenerator {
  public generateWeeklyReview(lifeModel: LifeModel, userName: string): string {
    const metrics = lifeModel.getMetrics();
    const snapshot = lifeModel.getSnapshot();
    const profile = lifeModel.getProfile();

    const header = `Sayın ${userName}, haftalık MONI değerlendirme raporunuz hazır.`;
    const scoreSummary = `Bu hafta genel yaşam skorunuz ${metrics.overallLifeScore}/100, aktivite skorunuz ise ${metrics.activityScore}/100 olarak gerçekleşti.`;
    
    const goalsSummary = profile.goals.completedGoals.length > 0 
      ? `Tebrikler, bu hafta tamamlanan hedefleriniz: ${profile.goals.completedGoals.join(', ')}.`
      : "Bu hafta henüz tamamlanan bir hedefiniz bulunmuyor, ancak çalışmalarınız devam ediyor.";

    const tasksSummary = `Haftayı ${snapshot.todayTasksCount} adet pending görev ile tamamlıyorsunuz.`;
    const memorySummary = `Hafızanızda toplam ${snapshot.memoryCount} adet kalıcı bilgi bulunuyor.`;

    const recommendation = "Gelecek hafta için spora daha fazla zaman ayırmanızı ve görevlerinizi günlere dengeli dağıtmanızı öneririm.";

    return `${header} ${scoreSummary} ${goalsSummary} ${tasksSummary} ${memorySummary} ${recommendation}`.replace(/\s+/g, ' ').trim();
  }
}
