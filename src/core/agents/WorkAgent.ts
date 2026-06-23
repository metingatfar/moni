import { BaseAgent } from './BaseAgent';
import type { AgentContext } from './AgentContext';
import type { AgentResult } from './AgentResult';

export class WorkAgent extends BaseAgent {
  public id = 'work_agent';
  public name = 'WorkAgent';
  public description = 'Kullanıcının iş, çalışma, toplantı ve proje yönetimlerini organize eder.';
  public capabilities = ['manage_meetings', 'evaluate_projects', 'organize_workday'];

  public async canHandle(input: string, _context: AgentContext): Promise<boolean> {
    const text = input.toLowerCase();
    const triggers = ['işlerimi toparla', 'toplantı planla', 'toplantı', 'proje durumumu', 'proje durumu', 'sunum', 'kodlama'];
    return triggers.some(t => text.includes(t));
  }

  public async execute(input: string, context: AgentContext): Promise<AgentResult> {
    const confidence = 0.9;
    const text = input.toLowerCase();

    if (text.includes('işlerimi toparla') || text.includes('bugünkü işlerimi')) {
      const pendingTasksCount = context.lifeSnapshot ? context.lifeSnapshot.todayTasksCount : 0;
      return this.safeResponse(
        `Bugün kalan ${pendingTasksCount} adet göreviniz ve planlanmış etkinlikleriniz bulunuyor. Öncelikli olanları üst sıraya alarak çalışmaya başlayabilirsiniz.`,
        confidence
      );
    }

    if (text.includes('toplantı planla')) {
      return this.needsConfirmation(
        "Yeni bir toplantı planlamamı ister misiniz? Saat, katılımcı ve konum bilgilerini belirterek onaylayabilirsiniz.",
        confidence,
        [{
          tool: 'reminders',
          params: { action: 'add', title: 'Planlanan Toplantı' }
        }]
      );
    }

    return this.safeResponse(
      "Mevcut projeleriniz ve iş planlamalarınız üzerinde koordinasyonu sağlamaya devam ediyorum.",
      confidence
    );
  }
}
