import type { Tool } from './ToolManager';

export class CameraTool implements Tool {
  name = 'camera';
  description = 'Kamera açma ve resim çekme işlemlerini tetikler.';

  async execute(args: { action: 'capture' }): Promise<any> {
    console.log('[CameraTool] Accessing camera:', args);
    return { success: true, photoPath: '/tmp/photo.jpg' };
  }
}
