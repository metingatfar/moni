import type { Tool } from './ToolManager';
import { databaseService } from '../../data/db/LocalDatabase';
import { eventBus } from '../events/EventBus';
import type { MemoryCategory } from '../../domain/entities/MemoryItem';

export class MemoryTool implements Tool {
  name = 'memory';
  description = 'Kalıcı hafıza çıkarma ve arama işlemlerini yönetir.';

  async execute(args: { action: 'save' | 'query'; text?: string; category?: string }): Promise<any> {
    console.log('[MemoryTool] Executing memory action:', args);
    if (args.action === 'save' && args.text) {
      const newMemory = {
        id: Date.now().toString(),
        category: (args.category as MemoryCategory) || 'general',
        content: args.text,
        timestamp: new Date().toISOString()
      };
      await databaseService.saveMemory(newMemory);
      eventBus.publish('MemorySaved', newMemory);
      return { success: true, message: 'Bilgi hafızaya kaydedildi.', memory: newMemory };
    }
    return { success: true, memory: 'İşlem tamamlandı.' };
  }
}

