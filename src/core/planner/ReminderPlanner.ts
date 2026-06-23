export class ReminderPlanner {
  public isReminderCommand(text: string): boolean {
    const textLower = text.toLowerCase();
    return [
      'hatırlat', 'hatirlat', 'uyar', 'alarm', 'hatırlatıcı', 'hatirlatici'
    ].some(trigger => textLower.includes(trigger));
  }

  public parse(text: string): any {
    const title = text.replace(/(hatırlat|hatirlat|uyar|alarm|hatırlatıcı|hatirlatici)/gi, '').trim();
    return {
      title: title || 'Yeni Hatırlatıcı',
      time: '09:00' // Default fallback
    };
  }
}
