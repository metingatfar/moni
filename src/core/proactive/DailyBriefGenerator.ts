import type { LifeModel } from '../life/LifeModel';
import type { RecommendationEngineV2 } from './RecommendationEngineV2';
import type { RiskEngine } from './RiskEngine';
import { container } from '../container/ServiceContainer';

export class DailyBriefGenerator {
  private recEngine: RecommendationEngineV2;
  private riskEngine: RiskEngine;

  constructor(recEngine: RecommendationEngineV2, riskEngine: RiskEngine) {
    this.recEngine = recEngine;
    this.riskEngine = riskEngine;
  }

  public generateBrief(lifeModel: LifeModel, userName: string): string {
    const snapshot = lifeModel.getSnapshot();
    const metrics = lifeModel.getMetrics();
    const profile = lifeModel.getProfile();

    const todayStr = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // Fetch suggestions and risks
    const recs = this.recEngine.getRecommendations(lifeModel);
    const risks = this.riskEngine.getRisks(lifeModel);

    const greeting = `Merhaba ${userName}, bugün ${todayStr}.`;
    const tasksPart = snapshot.todayTasksCount > 0 
      ? `Bugün yapmanız gereken ${snapshot.todayTasksCount} adet tamamlanmamış göreviniz bulunuyor.`
      : "Bugün için planlanmış acil bir göreviniz görünmüyor.";
    
    const meetingsPart = snapshot.upcomingMeetings.length > 0
      ? `Yaklaşan toplantılarınız şunlar: ${snapshot.upcomingMeetings.slice(0, 2).join(', ')}.`
      : "Bugün herhangi bir toplantınız bulunmuyor.";

    let goalsPart = "";
    try {
      const goalEngine = container.resolve<any>('GoalEngine');
      if (goalEngine) {
        const activeGoals = goalEngine.getGoals().filter((g: any) => g.status === 'active');
        if (activeGoals.length > 0) {
          goalsPart = `Aktif olarak takip ettiğiniz ${activeGoals.length} hedefiniz bulunuyor. En güncel hedefiniz olan "${activeGoals[0].title}" üzerinde ilerleme oranınız yüzde ${activeGoals[0].progress} seviyesindedir.`;
        }
      }
    } catch (_) {
      goalsPart = profile.goals.activeGoals.length > 0
        ? `Aktif olarak takip ettiğiniz ${profile.goals.activeGoals.length} hedefiniz var.`
        : "";
    }

    const scorePart = `Genel yaşam kalitesi skorunuz yüz üzerinden ${metrics.overallLifeScore} olarak hesaplandı.`;

    const recPart = recs.length > 0 ? `Size önerim: ${recs[0]}` : "";
    const riskPart = risks.length > 0 ? `Dikkat etmeniz gereken bir nokta: ${risks[0]}` : "";

    const motivation = "Harika bir gün geçirmenizi dilerim, her şey yolunda gidecektir.";

    // Assemble text without markdown, bullets, or asterisks to make it fully suitable for TTS read-aloud
    const fullBrief = `${greeting} ${tasksPart} ${meetingsPart} ${goalsPart} ${scorePart} ${recPart} ${riskPart} ${motivation}`.replace(/\s+/g, ' ').trim();
    
    return fullBrief;
  }
}
