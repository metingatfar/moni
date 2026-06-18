export interface Todo {
  id: string;
  task: string;
  dateTime: Date;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
}
