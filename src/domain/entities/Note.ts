export interface Note {
  id: string;
  title: string;
  content: string;
  dateTime: Date;
  color?: string; // Hex or color class name for cards
}
