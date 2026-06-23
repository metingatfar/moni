import { eventBus } from './EventBus';

export function setupDefaultSubscribers(): void {
  eventBus.subscribe('TaskAdded', (e) => {
    console.log('[Subscriber] TaskAdded processed:', e.payload);
  });

  eventBus.subscribe('ReminderCreated', (e) => {
    console.log('[Subscriber] ReminderCreated processed:', e.payload);
  });

  eventBus.subscribe('MemorySaved', (e) => {
    console.log('[Subscriber] MemorySaved processed:', e.payload);
  });

  eventBus.subscribe('ConversationCompleted', (e) => {
    console.log('[Subscriber] ConversationCompleted processed:', e.payload);
  });
}
