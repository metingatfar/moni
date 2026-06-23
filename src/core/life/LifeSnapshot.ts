export interface LifeSnapshot {
  todayTasksCount: number;
  activeGoalsCount: number;
  lastSportDate: string | null;
  lastWeight: number | null;
  lastBP: string | null; // e.g. "120/80"
  upcomingMeetings: string[];
  lastConversationTopic: string;
  lastUsedTool: string | null;
  activeConversationMode: string;
  memoryCount: number;
  conversationCount: number;
  timestamp: string;
}
