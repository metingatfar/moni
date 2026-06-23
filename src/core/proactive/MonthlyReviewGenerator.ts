import type { LifeModel } from '../life/LifeModel';

export class MonthlyReviewGenerator {
  public generateMonthlyReview(lifeModel: LifeModel, userName: string): string {
    const metrics = lifeModel.getMetrics();
    const profile = lifeModel.getProfile();

    const title = `Merhaba ${userName}, aylık gelişim ve yaşam raporunuzu derledim.`;
    const overview = `Geçtiğimiz ay boyunca genel üretkenlik skorunuz ${metrics.productivityScore}/100 seviyesindeyken, sağlık skorunuz ${metrics.healthScore}/100 civarında seyretti.`;
    
    const projectCount = profile.projects.length;
    const workSummary = projectCount > 0 
      ? `Aktif ${projectCount} proje üzerinde istikrarlı çalışmaya devam ettiniz.`
      : "Projeleriniz üzerinde planlama çalışmalarınız sürüyor.";

    const habitSummary = `Alışkanlık tutarlılığınız yüz üzerinden ${metrics.consistencyScore} olarak hesaplandı.`;

    const tip = "Önümüzdeki ay için iş-yaşam dengesini gözeterek kendinize dinlenme zamanları yaratmanızı ve sağlık verilerinizi daha düzenli girmenizi öneririm.";

    return `${title} ${overview} ${workSummary} ${habitSummary} ${tip}`.replace(/\s+/g, ' ').trim();
  }
}
