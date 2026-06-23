export class ReminderPlanner {
    isReminderCommand(text) {
        const textLower = text.toLowerCase();
        return [
            'hatırlat', 'hatirlat', 'uyar', 'alarm', 'hatırlatıcı', 'hatirlatici'
        ].some(trigger => textLower.includes(trigger));
    }
    parse(text) {
        const title = text.replace(/(hatırlat|hatirlat|uyar|alarm|hatırlatıcı|hatirlatici)/gi, '').trim();
        return {
            title: title || 'Yeni Hatırlatıcı',
            time: '09:00' // Default fallback
        };
    }
}
