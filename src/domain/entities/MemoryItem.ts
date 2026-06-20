export type MemoryCategory =
  | 'name'
  | 'job'
  | 'projects'
  | 'habits'
  | 'importantNotes'
  | 'ongoingTasks'
  | 'preferences'
  | 'general';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  content: string;
  timestamp: string; // ISOString date format
}
