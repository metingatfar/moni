import { databaseService } from '../data/db/LocalDatabase';
import { TaskParser } from './TaskParser';
import { ReminderParser } from './ReminderParser';
import { MeetingParser } from './MeetingParser';
import { NoteParser } from './NoteParser';
import { SecretaryCommandRouter } from './SecretaryCommandRouter';
import type { CommandType } from './SecretaryCommandRouter';
import type { Todo } from '../domain/entities/Todo';
import type { Reminder } from '../domain/entities/Reminder';
import type { Note } from '../domain/entities/Note';

export interface SecretaryResult {
  type: CommandType;
  success: boolean;
  message: string;
  data?: any;
  waitingFor?: 'confirmation' | 'date_clarification';
}

/**
 * @deprecated Use Planner and ExecutiveBrain instead.
 */
export class SecretaryService {
  /**
   * Processes a natural language user command, determining if it should be saved, confirmed, or clarified.
   */
  public static async processCommand(
    text: string,
    activeProjects: string[],
    userName: string,
    apiKey?: string
  ): Promise<SecretaryResult> {
    // 1. Determine intent
    const route = await SecretaryCommandRouter.route(text, apiKey);
    
    if (route.type === 'chat') {
      return { type: 'chat', success: false, message: '' };
    }

    // 2. Parse command details based on type
    let parsedData: any = null;
    if (route.type === 'task') {
      parsedData = await TaskParser.parse(text, activeProjects, apiKey);
    } else if (route.type === 'reminder') {
      parsedData = await ReminderParser.parse(text, apiKey);
    } else if (route.type === 'meeting') {
      parsedData = await MeetingParser.parse(text, apiKey);
    } else if (route.type === 'note') {
      parsedData = NoteParser.parse(text);
    }

    // 3. Check for missing date/time (Task, Reminder, Meeting require Date)
    if (route.type !== 'note' && (!parsedData || !parsedData.dateTime)) {
      const typeLabels: Record<string, string> = { task: 'görev', reminder: 'hatırlatıcı', meeting: 'toplantı', note: 'not' };
      const label = typeLabels[route.type] || 'etkinlik';
      return {
        type: route.type,
        success: true,
        message: `Bu ${label} için bir tarih veya saat belirtebilir misiniz?`,
        data: parsedData,
        waitingFor: 'date_clarification'
      };
    }

    // 4. Handle ambiguous statements requiring confirmation
    if (!route.isClear || route.waitingFor === 'confirmation') {
      const friendlyDate = this.formatTurkishFriendlyDate(parsedData.dateTime);
      const typeLabels: Record<string, string> = { task: 'görev', reminder: 'hatırlatıcı', meeting: 'toplantı', note: 'not' };
      const label = typeLabels[route.type] || 'etkinlik';
      
      let message = `Bunu ${friendlyDate} için ${label} olarak eklememi ister misiniz?`;
      if (route.type === 'task' && parsedData.project) {
        message = `Bunu ${friendlyDate} için ${parsedData.project} projesine görev olarak eklememi onaylıyor musunuz?`;
      }

      return {
        type: route.type,
        success: true,
        message,
        data: parsedData,
        waitingFor: 'confirmation'
      };
    }

    // 5. Direct save if command is clear
    return this.saveCommand(route.type, parsedData, userName);
  }

  /**
   * Helper to perform database save operation directly.
   */
  public static async saveCommand(
    type: CommandType,
    data: any,
    userName: string
  ): Promise<SecretaryResult> {
    const nameStr = userName ? ` ${userName}` : '';

    if (type === 'task') {
      const newTodo: Todo = {
        id: Date.now().toString(),
        task: data.project ? `[${data.project}] ${data.task}` : data.task,
        dateTime: data.dateTime || new Date(),
        isCompleted: false,
        priority: data.priority || 'medium'
      };
      await databaseService.saveTodo(newTodo);
      
      let feedback = `Tamam${nameStr}, '${newTodo.task}' görevini yapılacaklar listene ekledim.`;
      if (data.project) {
        feedback = `Görevi ${data.project} projesine ekledim.`;
      }
      return { type, success: true, message: feedback, data: newTodo };
    }

    if (type === 'reminder') {
      const newReminder: Reminder = {
        id: Date.now().toString(),
        title: data.title,
        dateTime: data.dateTime,
        isCompleted: false
      };
      await databaseService.saveReminder(newReminder);
      
      const friendlyDate = this.formatTurkishFriendlyDate(data.dateTime);
      return { 
        type, 
        success: true, 
        message: `Tamam${nameStr}, hatırlatıcıyı ${friendlyDate} için oluşturdum.`, 
        data: newReminder 
      };
    }

    if (type === 'meeting') {
      let title = data.title;
      if (data.participant) {
        title = `${data.participant} ile Toplantı`;
      } else {
        title = `Toplantı: ${data.title}`;
      }
      let desc = '';
      if (data.location) desc += `Yer: ${data.location}. `;
      if (data.description) desc += data.description;

      const newMeetingReminder: Reminder = {
        id: Date.now().toString(),
        title,
        dateTime: data.dateTime,
        description: desc.trim() || undefined,
        isCompleted: false
      };
      await databaseService.saveReminder(newMeetingReminder);

      const friendlyDate = this.formatTurkishFriendlyDate(data.dateTime);
      return {
        type,
        success: true,
        message: `Tamam${nameStr}, bunu ${friendlyDate} için takvimine ekledim.`,
        data: newMeetingReminder
      };
    }

    if (type === 'note') {
      const newNote: Note = {
        id: Date.now().toString(),
        title: data.title,
        content: data.content,
        dateTime: new Date(),
        color: '#ffd700'
      };
      await databaseService.saveNote(newNote);
      return { 
        type, 
        success: true, 
        message: `Tamam${nameStr}, '${newNote.title}' notunu not defterine kaydettim.`, 
        data: newNote 
      };
    }

    return { type: 'chat', success: false, message: '' };
  }

  /**
   * Helper to format Date into a friendly Turkish representation.
   */
  public static formatTurkishFriendlyDate(date: Date): string {
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear();
    
    const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) {
      return `bugün saat ${timeStr}`;
    }
    if (isTomorrow) {
      return `yarın saat ${timeStr}`;
    }
    
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dayName = dayNames[date.getDay()];
    
    return `${dayName} günü saat ${timeStr}`;
  }
}
