import type { Tool } from './ToolManager';

export class NotificationTool implements Tool {
  name = 'notification';
  description = 'Bildirim tetikleme işlemlerini yönetir.';

  async execute(args: { message: string }): Promise<any> {
    console.log('[NotificationTool] Dispatching notification:', args.message);
    window.dispatchEvent(new CustomEvent('moni_info_notification', {
      detail: { message: args.message }
    }));
    return { success: true };
  }
}
