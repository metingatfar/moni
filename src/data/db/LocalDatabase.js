import { SecurityHelper } from '../../memory/SecurityHelper';
export class LocalDatabase {
    getStorageItem(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        }
        catch (e) {
            console.error(`Error reading ${key} from storage`, e);
            return defaultValue;
        }
    }
    setStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (e) {
            console.error(`Error writing ${key} to storage`, e);
        }
    }
    // Contacts
    async getContacts() {
        return this.getStorageItem('moni_contacts', [
            { id: '1', name: 'Ahmet Yılmaz', phoneNumber: '+905551234567', email: 'ahmet@example.com', notes: 'İş ortağı' },
            { id: '2', name: 'Zeynep Kaya', phoneNumber: '+905329876543', email: 'zeynep@example.com', notes: 'Kişisel asistan' }
        ]);
    }
    async saveContact(contact) {
        const contacts = await this.getContacts();
        const existingIndex = contacts.findIndex(c => c.id === contact.id);
        if (existingIndex > -1) {
            contacts[existingIndex] = contact;
        }
        else {
            contacts.push(contact);
        }
        this.setStorageItem('moni_contacts', contacts);
    }
    async deleteContact(id) {
        const contacts = await this.getContacts();
        const filtered = contacts.filter(c => c.id !== id);
        this.setStorageItem('moni_contacts', filtered);
    }
    // Reminders
    async getReminders() {
        const data = this.getStorageItem('moni_reminders', [
            { id: '1', title: 'Haftalık Brifing Raporu', dateTime: new Date(Date.now() + 3600000).toISOString(), description: 'Proje ilerleme durumu inceleme toplantısı', isCompleted: false },
            { id: '2', title: 'E-postaları Yanıtla', dateTime: new Date(Date.now() + 7200000).toISOString(), description: 'Müşteri geri bildirim e-postaları', isCompleted: false }
        ]);
        // Convert date strings back to Date objects
        return data.map(r => ({ ...r, dateTime: new Date(r.dateTime) }));
    }
    async saveReminder(reminder) {
        const reminders = await this.getReminders();
        const existingIndex = reminders.findIndex(r => r.id === reminder.id);
        if (existingIndex > -1) {
            reminders[existingIndex] = reminder;
        }
        else {
            reminders.push(reminder);
        }
        this.setStorageItem('moni_reminders', reminders);
    }
    async deleteReminder(id) {
        const reminders = await this.getReminders();
        const filtered = reminders.filter(r => r.id !== id);
        this.setStorageItem('moni_reminders', filtered);
    }
    // Notes
    async getNotes() {
        const data = this.getStorageItem('moni_notes', [
            { id: '1', title: 'FitHayat Toplantı Notları', content: 'Beslenme planı entegrasyonu detayları görüşülecek.', dateTime: new Date(Date.now() - 86400000).toISOString(), color: '#7b2cbf' },
            { id: '2', title: 'Alışveriş Listesi', content: 'Su, süt, yulaf ezmesi, yeşil çay, protein barı alınacak.', dateTime: new Date(Date.now()).toISOString(), color: '#00f0ff' }
        ]);
        return data.map(n => ({ ...n, dateTime: new Date(n.dateTime) }));
    }
    async saveNote(note) {
        const notes = await this.getNotes();
        const existingIndex = notes.findIndex(n => n.id === note.id);
        if (existingIndex > -1) {
            notes[existingIndex] = note;
        }
        else {
            notes.push(note);
        }
        this.setStorageItem('moni_notes', notes);
    }
    async deleteNote(id) {
        const notes = await this.getNotes();
        const filtered = notes.filter(n => n.id !== id);
        this.setStorageItem('moni_notes', filtered);
    }
    // Todos
    async getTodos() {
        const data = this.getStorageItem('moni_todos', [
            { id: '1', task: 'FitHayat API entegrasyonunu kontrol et', dateTime: new Date(Date.now() - 3600000).toISOString(), isCompleted: true, priority: 'high' },
            { id: '2', task: 'Ses efekti modülasyon testlerini bitir', dateTime: new Date(Date.now() + 3600000).toISOString(), isCompleted: false, priority: 'medium' },
            { id: '3', task: 'Takvim arayüzü çizimlerini doğrula', dateTime: new Date(Date.now() + 7200000).toISOString(), isCompleted: false, priority: 'low' }
        ]);
        return data.map(t => ({ ...t, dateTime: new Date(t.dateTime) }));
    }
    async saveTodo(todo) {
        const todos = await this.getTodos();
        const existingIndex = todos.findIndex(t => t.id === todo.id);
        if (existingIndex > -1) {
            todos[existingIndex] = todo;
        }
        else {
            todos.push(todo);
        }
        this.setStorageItem('moni_todos', todos);
    }
    async deleteTodo(id) {
        const todos = await this.getTodos();
        const filtered = todos.filter(t => t.id !== id);
        this.setStorageItem('moni_todos', filtered);
    }
    // Chat History
    async getChatHistory() {
        const data = this.getStorageItem('moni_chat_history', []);
        return data.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
    }
    async saveChatMessage(message) {
        const history = await this.getChatHistory();
        history.push(message);
        this.setStorageItem('moni_chat_history', history);
    }
    async clearChatHistory() {
        localStorage.removeItem('moni_chat_history');
    }
    // Memory Management
    async getMemories() {
        const encryptedData = localStorage.getItem('moni_memories');
        if (!encryptedData) {
            return [];
        }
        try {
            const decrypted = SecurityHelper.decrypt(encryptedData);
            if (!decrypted)
                return [];
            const parsed = JSON.parse(decrypted);
            return parsed.map((m) => ({
                ...m
            }));
        }
        catch (e) {
            console.error('LocalDatabase: Error parsing memories', e);
            return [];
        }
    }
    async saveMemory(memory) {
        const memories = await this.getMemories();
        const existingIndex = memories.findIndex(m => m.id === memory.id);
        if (existingIndex > -1) {
            memories[existingIndex] = memory;
        }
        else {
            memories.push(memory);
        }
        try {
            const encrypted = SecurityHelper.encrypt(JSON.stringify(memories));
            localStorage.setItem('moni_memories', encrypted);
        }
        catch (e) {
            console.error('LocalDatabase: Error writing memories to storage', e);
        }
    }
    async deleteMemory(id) {
        const memories = await this.getMemories();
        const filtered = memories.filter(m => m.id !== id);
        try {
            const encrypted = SecurityHelper.encrypt(JSON.stringify(filtered));
            localStorage.setItem('moni_memories', encrypted);
        }
        catch (e) {
            console.error('LocalDatabase: Error writing memories to storage after deletion', e);
        }
    }
    async clearMemories() {
        localStorage.removeItem('moni_memories');
    }
}
export const databaseService = new LocalDatabase();
