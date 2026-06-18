export interface Reminder {
  id: string;
  title: string;
  dateTime: Date;
  description?: string;
  isCompleted: boolean;
}
