import type { PlanSteps } from './Planner';

export class GoalPlanner {
  private travelTriggers: string[] = ['gidiyorum', 'seyahat', 'uçuş', 'bilet', 'otel', 'yolculuk', 'ankara', 'istanbul', 'izmir'];

  public isMultiStepGoal(text: string): boolean {
    return this.travelTriggers.some(trigger => text.includes(trigger));
  }

  public async generateGoalPlan(text: string, _context?: any): Promise<PlanSteps> {
    const textLower = text.toLowerCase();
    const steps: PlanSteps['steps'] = [];
    const recommendations: string[] = [];

    if (textLower.includes('ankara') || textLower.includes('gidiyorum')) {
      steps.push({
        action: 'create_task',
        type: 'task',
        payload: { title: 'Seyahat bavulunu hazırla', priority: 'medium' }
      });
      steps.push({
        action: 'create_reminder',
        type: 'reminder',
        payload: { title: 'Yola çıkmadan önce biletleri kontrol et', time: '09:00' }
      });
      recommendations.push(
        'Ankara seyahatiniz için hava durumunu kontrol etmenizi ve kalacağınız otel rezervasyonunu doğrulamanızı öneririm.',
        'Seyahat öncesi yapılacaklar listenize bavul hazırlama görevi eklendi.'
      );
    } else {
      steps.push({
        action: 'create_task',
        type: 'task',
        payload: { title: 'Seyahat planı detaylarını çıkar', priority: 'low' }
      });
      recommendations.push('Seyahat rotanızı oluşturup takviminize işleyebilirsiniz.');
    }

    return { steps, recommendations };
  }
}
