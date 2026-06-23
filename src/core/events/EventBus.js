export class EventBus {
    static instance;
    subscribers = new Map();
    constructor() { }
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    subscribe(type, callback) {
        if (!this.subscribers.has(type)) {
            this.subscribers.set(type, new Set());
        }
        this.subscribers.get(type).add(callback);
        // Return an unsubscribe method
        return () => {
            const set = this.subscribers.get(type);
            if (set) {
                set.delete(callback);
            }
        };
    }
    publish(type, payload) {
        const event = {
            type,
            payload,
            timestamp: new Date()
        };
        console.log(`[EventBus] Publishing event: ${type}`, payload);
        const set = this.subscribers.get(type);
        if (set) {
            set.forEach(callback => {
                try {
                    callback(event);
                }
                catch (err) {
                    console.error(`[EventBus] Error in subscriber callback for ${type}:`, err);
                }
            });
        }
    }
}
export const eventBus = EventBus.getInstance();
