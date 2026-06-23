export class MeetingPlanner {
  public isMeetingCommand(text: string): boolean {
    const textLower = text.toLowerCase().trim();
    
    // Explicitly exclude single greetings
    const greetings = ['merhaba', 'selam', 'günaydın', 'iyi akşamlar', 'nasılsın', 'moni', 'hey moni', 'merhaba moni'];
    if (greetings.includes(textLower)) {
      return false;
    }

    return [
      'toplantı', 'toplanti', 'görüşme', 'gorusme', 'planla', 'ayarla', 'takvime ekle', 'saat', 'tarih', 'randevu'
    ].some(trigger => textLower.includes(trigger));
  }

  public parse(text: string): any {
    const title = text.replace(/(toplantı|toplanti|görüşme|gorusme|buluşma|bulusma|randevu|ayarla|ekle)/gi, '').trim();
    return {
      title: title || 'Yeni Toplantı',
      duration: 60 // Default fallback duration in minutes
    };
  }
}
