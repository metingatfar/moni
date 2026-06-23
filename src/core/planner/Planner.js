import { TaskPlanner } from './TaskPlanner';
import { ReminderPlanner } from './ReminderPlanner';
import { MeetingPlanner } from './MeetingPlanner';
import { GoalPlanner } from './GoalPlanner';
import { personalityEngine } from '../personality/PersonalityEngine';
export class Planner {
    taskPlanner;
    reminderPlanner;
    meetingPlanner;
    goalPlanner;
    constructor() {
        this.taskPlanner = new TaskPlanner();
        this.reminderPlanner = new ReminderPlanner();
        this.meetingPlanner = new MeetingPlanner();
        this.goalPlanner = new GoalPlanner();
    }
    /**
     * Generates a multi-step plan or schedules direct events based on user input.
     */
    async plan(text, context) {
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
        // Check if it's a high-level goal that warrants multi-step planning
        if (this.goalPlanner.isMultiStepGoal(textLower)) {
            return this.goalPlanner.generateGoalPlan(text, context);
        }
        const steps = [];
        const recommendations = [];
        if (this.taskPlanner.isTaskCommand(textLower)) {
            const taskData = this.taskPlanner.parse(text);
            steps.push({ action: 'create_task', type: 'task', payload: taskData });
            recommendations.push('Görev listeniz güncellendi.');
        }
        else if (this.reminderPlanner.isReminderCommand(textLower)) {
            const reminderData = this.reminderPlanner.parse(text);
            steps.push({ action: 'create_reminder', type: 'reminder', payload: reminderData });
            recommendations.push('Hatırlatıcı kuruldu.');
        }
        else if (this.meetingPlanner.isMeetingCommand(textLower)) {
            const meetingData = this.meetingPlanner.parse(text);
            steps.push({ action: 'create_meeting', type: 'meeting', payload: meetingData });
            recommendations.push('Toplantı takviminize eklendi.');
        }
        return { steps, recommendations };
    }
}
