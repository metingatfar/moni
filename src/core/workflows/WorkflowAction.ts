export interface WorkflowAction {
  type: 'createTask' | 'createReminder' | 'createCalendarEvent' | 'sendNotification' | 'speakMessage' | 'updateGoal' | 'updateLifeModel' | 'saveMemory' | 'runAgent' | 'runTool';
  params: any;
}
