import type { Tool } from './ToolManager';
import { databaseService } from '../../data/db/LocalDatabase';
import { eventBus } from '../events/EventBus';

export class ReminderTool implements Tool {
  name = 'reminders';
  description = 'Hatırlatıcı ekleme ve listeleme işlemlerini yönetir.';

  async execute(args: { action: 'add' | 'list'; title?: string; time?: string }): Promise<any> {
    console.log('[ReminderTool] Managing reminders:', args);
    if (args.action === 'add') {
      const reminderTitle = args.title || 'Yeni Hatırlatıcı';
      // Parse time if possible or default to 1 hour from now
      let date = new Date(Date.now() + 3600000);
      if (args.time) {
        try {
          const parts = args.time.split(':');
          if (parts.length >= 2) {
            date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
          }
        } catch (_) {}
      }
      const newReminder = {
        id: Date.now().toString(),
        title: reminderTitle,
        dateTime: date,
        isCompleted: false
      };
      await databaseService.saveReminder(newReminder);
      eventBus.publish('ReminderCreated', newReminder);
      return { success: true, message: `'${reminderTitle}' hatırlatıcısı başarıyla kuruldu.`, data: newReminder };
    }
    return { success: true, message: 'İşlem tamamlandı.' };
  }
}

