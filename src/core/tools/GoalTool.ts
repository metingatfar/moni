import type { Tool } from './ToolManager';
import { goalEngine } from '../goals/GoalEngine';

export class GoalTool implements Tool {
  name = 'goals';
  description = 'Hedef oluşturma, güncelleme ve tamamlama işlemlerini yönetir.';

  async execute(args: { action: 'create' | 'update' | 'complete'; id?: string; title?: string; category?: string; priority?: 'low' | 'medium' | 'high'; difficulty?: 'easy' | 'medium' | 'hard'; deadline?: string }): Promise<any> {
    console.log('[GoalTool] Executing goal action:', args);
    if (args.action === 'create' && args.title) {
      const newGoal = goalEngine.createGoal(args.title, args.category || 'other', args.priority || 'medium', args.difficulty || 'medium', args.deadline);
      return { success: true, message: `'${args.title}' hedefi başarıyla oluşturuldu.`, data: newGoal };
    }
    if (args.action === 'complete' && args.id) {
      const ok = goalEngine.completeGoal(args.id);
      return { success: ok, message: ok ? 'Hedef tamamlandı.' : 'Hedef bulunamadı.' };
    }
    return { success: false, message: 'Geçersiz hedef işlemi.' };
  }
}
