export type MemoryCategory =
  | 'identity'
  | 'preference'
  | 'health'
  | 'sport'
  | 'work'
  | 'relationship'
  | 'routine'
  | 'goal'
  | 'location'
  | 'custom'
  // Legacy categories for backward compatibility
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
  timestamp?: string; // ISOString date format (optional/required backward-compatibility)
  confidence?: number;
  source?: 'explicit' | 'implicit' | 'manual';
  createdAt?: string;
  updatedAt?: string;
  lastUsedAt?: string;
  importance?: number;
}
