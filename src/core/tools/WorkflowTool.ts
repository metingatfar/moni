import type { Tool } from './ToolManager';
import { workflowEngine } from '../workflows/WorkflowEngine';

export class WorkflowTool implements Tool {
  name = 'workflows';
  description = 'Otomatik iş akışlarını oluşturma, yürütme ve duraklatma işlemlerini yönetir.';

  async execute(args: { action: 'create' | 'execute' | 'pause' | 'resume'; id?: string; text?: string; goalId?: string }): Promise<any> {
    console.log('[WorkflowTool] Executing workflow action:', args);
    if (args.action === 'create' && args.text) {
      const wf = workflowEngine.createWorkflowFromText(args.text, args.goalId);
      return { success: true, message: `'${wf.title}' iş akışı başarıyla oluşturuldu.`, data: wf };
    }
    if (args.action === 'execute' && args.id) {
      const ok = await workflowEngine.executeWorkflow(args.id);
      return { success: ok, message: ok ? 'İş akışı başarıyla yürütüldü.' : 'İş akışı yürütme başarısız.' };
    }
    if (args.action === 'pause' && args.id) {
      workflowEngine.pauseWorkflow(args.id);
      return { success: true, message: 'İş akışı duraklatıldı.' };
    }
    if (args.action === 'resume' && args.id) {
      workflowEngine.resumeWorkflow(args.id);
      return { success: true, message: 'İş akışı yeniden başlatıldı.' };
    }
    return { success: false, message: 'Geçersiz iş akışı işlemi.' };
  }
}
