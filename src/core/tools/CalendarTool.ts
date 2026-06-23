import type { Tool } from './ToolManager';

export class CalendarTool implements Tool {
  name = 'calendar';
  description = 'Takvim buluşmalarını ve toplantıları yönetir.';

  async execute(args: { action: 'add' | 'list'; title?: string; date?: string }): Promise<any> {
    console.log('[CalendarTool] Executing action:', args.action, args);
    return { success: true, message: 'Takvim işlemi başarıyla tamamlandı.' };
  }
}
