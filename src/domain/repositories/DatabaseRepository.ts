import type { Contact } from '../entities/Contact';
import type { Reminder } from '../entities/Reminder';
import type { Note } from '../entities/Note';
import type { Todo } from '../entities/Todo';
import type { Message } from './AiRepository';

export interface DatabaseRepository {
  // Contacts Management
  getContacts(): Promise<Contact[]>;
  saveContact(contact: Contact): Promise<void>;
  deleteContact(id: string): Promise<void>;

  // Reminders Management
  getReminders(): Promise<Reminder[]>;
  saveReminder(reminder: Reminder): Promise<void>;
  deleteReminder(id: string): Promise<void>;

  // Notes Management
  getNotes(): Promise<Note[]>;
  saveNote(note: Note): Promise<void>;
  deleteNote(id: string): Promise<void>;

  // Todos Management
  getTodos(): Promise<Todo[]>;
  saveTodo(todo: Todo): Promise<void>;
  deleteTodo(id: string): Promise<void>;

  // Chat History Management
  getChatHistory(): Promise<Message[]>;
  saveChatMessage(message: Message): Promise<void>;
  clearChatHistory(): Promise<void>;
}
