import { TaskPlanner } from './TaskPlanner';
import { ReminderPlanner } from './ReminderPlanner';
import { MeetingPlanner } from './MeetingPlanner';
import { GoalPlanner } from './GoalPlanner';
import { personalityEngine } from '../personality/PersonalityEngine';

export interface PlanSteps {
  steps: {
    action: string;
    type: 'task' | 'reminder' | 'meeting' | 'note' | 'suggestion';
    payload: any;
  }[];
  recommendations: string[];
}

export class Planner {
  private taskPlanner: TaskPlanner;
  private reminderPlanner: ReminderPlanner;
  private meetingPlanner: MeetingPlanner;
  private goalPlanner: GoalPlanner;

  constructor() {
    this.taskPlanner = new TaskPlanner();
    this.reminderPlanner = new ReminderPlanner();
    this.meetingPlanner = new MeetingPlanner();
    this.goalPlanner = new GoalPlanner();
  }

  /**
   * Generates a multi-step plan or schedules direct events based on user input.
   */
  public async plan(text: string, context?: any): Promise<PlanSteps> {
    const textLower = text.toLowerCase().trim();

    // Intercept greetings and general chat sentences first
    const greetings = ['merhaba', 'selam', 'günaydın', 'iyi akşamlar', 'nasılsın', 'moni', 'hey moni', 'merhaba moni'];
    const isGreeting = greetings.some(g => textLower === g) || 
                       textLower.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim() === "merhaba moni" ||
                       textLower.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim() === "hey moni" ||
                       textLower.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim() === "moni";

    if (isGreeting) {
      return { steps: [], recommendations: [] };
    }

    // Intercept personality mode switch commands
    const modeSwitch = personalityEngine.detectModeSwitch(text);
    if (modeSwitch) {
      return { steps: [], recommendations: [] };
    }

    // Intercept memory commands and queries to prevent misrouting
    const memoryTriggers = ['hatırla', 'unutma', 'aklında tut', 'hafızana al', 'hafızaya kaydet', 'unut', 'sil', 'ne hatırlıyorsun', 'hakkımda ne biliyorsun', 'aklında ne var', 'nasıl içerim', 'sporum ne', 'hedefim ne', 'hedefim neydi'];
    const isMemoryAction = memoryTriggers.some(t => textLower.includes(t));
    if (isMemoryAction) {
      return { steps: [], recommendations: [] };
    }

    // Intercept if conversation engine is currently in multi-turn slot filling mode
    try {
      const { container } = await import('../container/ServiceContainer');
      const conversationEngine = container.resolve<any>('ConversationEngine');
      if (conversationEngine && conversationEngine.context.isMultiTurnActive()) {
        return { steps: [], recommendations: [] };
      }
    } catch (e) {}

    // Check if it's a high-level goal that warrants multi-step planning
    if (this.goalPlanner.isMultiStepGoal(textLower)) {
      return this.goalPlanner.generateGoalPlan(text, context);
    }

    const steps: PlanSteps['steps'] = [];
    const recommendations: string[] = [];

    if (this.taskPlanner.isTaskCommand(textLower)) {
      const taskData = this.taskPlanner.parse(text);
      steps.push({ action: 'create_task', type: 'task', payload: taskData });
      recommendations.push('Görev listeniz güncellendi.');
    } else if (this.reminderPlanner.isReminderCommand(textLower)) {
      const reminderData = this.reminderPlanner.parse(text);
      steps.push({ action: 'create_reminder', type: 'reminder', payload: reminderData });
      recommendations.push('Hatırlatıcı kuruldu.');
    } else if (this.meetingPlanner.isMeetingCommand(textLower)) {
      const meetingData = this.meetingPlanner.parse(text);
      steps.push({ action: 'create_meeting', type: 'meeting', payload: meetingData });
      recommendations.push('Toplantı takviminize eklendi.');
    }

    return { steps, recommendations };
  }
}
