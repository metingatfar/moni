import { BaseAgent } from './BaseAgent';
import type { AgentContext } from './AgentContext';
import type { AgentResult } from './AgentResult';

export class NotificationAgent extends BaseAgent {
  public id = 'notification_agent';
  public name = 'NotificationAgent';
  public description = 'Kullanıcı hatırlatıcılarını, alarmlarını ve önemli bildirimlerini yönetir.';
  public capabilities = ['create_reminder', 'schedule_alarm', 'trigger_notification'];

  public async canHandle(input: string, _context: AgentContext): Promise<boolean> {
    const text = input.toLowerCase();
    const triggers = ['hatırlat', 'hatirlat', 'bildir', 'alarm kur', 'hatırlatma yap'];
    return triggers.some(t => text.includes(t));
  }

  public async execute(input: string, _context: AgentContext): Promise<AgentResult> {
    const confidence = 0.95;
    const cleanText = input.replace(/hatırlat|hatirlat/gi, '').trim();

    return this.needsConfirmation(
      `Şu hatırlatıcıyı kurmak istediğinizi anladım: "${input}". Onaylıyor musunuz?`,
      confidence,
      [{
        tool: 'reminders',
        params: { action: 'add', title: cleanText || input }
      }]
    );
  }
}
