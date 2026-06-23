import type { Tool } from './ToolManager';
import { databaseService } from '../../data/db/LocalDatabase';
import { eventBus } from '../events/EventBus';

export class TaskTool implements Tool {
  name = 'tasks';
  description = 'Görev ekleme, listeleme ve durum güncelleme işlemlerini yönetir.';

  async execute(args: { action: 'add' | 'list' | 'complete'; title?: string; id?: string; priority?: 'high' | 'medium' | 'low' }): Promise<any> {
    console.log('[TaskTool] Managing tasks:', args);
    if (args.action === 'add') {
      const taskTitle = args.title || 'Yeni Görev';
      const newTodo = {
        id: Date.now().toString(),
        task: taskTitle,
        dateTime: new Date(),
        isCompleted: false,
        priority: args.priority || 'medium'
      };
      await databaseService.saveTodo(newTodo);
      eventBus.publish('TaskAdded', newTodo);
      return { success: true, message: `'${taskTitle}' görevi başarıyla eklendi.`, data: newTodo };
    } else if (args.action === 'complete' && args.id) {
      const todos = await databaseService.getTodos();
      const todo = todos.find(t => t.id === args.id);
      if (todo) {
        todo.isCompleted = true;
        await databaseService.saveTodo(todo);
        return { success: true, message: `Görev tamamlandı olarak işaretlendi.`, data: todo };
      }
      return { success: false, error: 'Görev bulunamadı.' };
    }
    return { success: true, message: 'İşlem tamamlandı.' };
  }
}

