export class ShortTermMemory {
    buffer = [];
    limit = 20;
    addMessage(role, content) {
        this.buffer.push({ role, content, timestamp: new Date() });
        if (this.buffer.length > this.limit) {
            this.buffer.shift();
        }
    }
    getMessages() {
        return this.buffer;
    }
    clear() {
        this.buffer = [];
    }
}
