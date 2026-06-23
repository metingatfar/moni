import type { Tool } from './ToolManager';

export class DosyaTool implements Tool {
  name = 'file';
  description = 'Dosya okuma ve yazma işlemlerini yönetir.';

  async execute(args: { action: 'read' | 'write'; path: string; content?: string }): Promise<any> {
    console.log('[DosyaTool] File access:', args);
    return { success: true };
  }
}
