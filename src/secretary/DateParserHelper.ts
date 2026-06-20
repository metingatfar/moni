export class DateParserHelper {
  /**
   * Extracts date and time from Turkish text.
   * Returns null if no date or time indicators are found.
   */
  public static parse(text: string): Date | null {
    const now = new Date();
    const textLower = text.toLowerCase();
    
    // Check if there are any date/time words at all
    const hasDateIndicator = this.checkDateIndicators(textLower);
    const hasTimeIndicator = this.checkTimeIndicators(textLower);

    if (!hasDateIndicator && !hasTimeIndicator) {
      return null; // Return null so we can ask for clarification
    }

    let targetDate = new Date(now);
    let dateSelected = false;

    // 1. Process relative date terms
    if (textLower.includes('yarın')) {
      targetDate.setDate(now.getDate() + 1);
      dateSelected = true;
    } else if (textLower.includes('öbür gün') || textLower.includes('ertesi gün')) {
      targetDate.setDate(now.getDate() + 2);
      dateSelected = true;
    } else if (textLower.includes('bugün')) {
      // Keep today
      dateSelected = true;
    } else {
      // Check day names
      const dayIndices: { [key: string]: number } = {
        'pazartesi': 1, 'salı': 2, 'sali': 2, 'çarşamba': 3, 'carsamba': 3,
        'perşembe': 4, 'persembe': 4, 'cuma': 5, 'cumartesi': 6, 'pazar': 0
      };

      for (const [dayName, dayIdx] of Object.entries(dayIndices)) {
        if (textLower.includes(dayName)) {
          const currentDay = now.getDay();
          let diff = dayIdx - currentDay;
          if (diff <= 0) {
            diff += 7; // Target next week's day
          }
          targetDate.setDate(now.getDate() + diff);
          dateSelected = true;
          break;
        }
      }
    }

    // 2. Process time indicators
    let hour = 9; // Default starting hour
    let minute = 0;
    let timeSelected = false;

    // e.g. "16:30", "16.30", "saat 16:30"
    const timeRegex = /(?:saat\s*)?(\d{1,2})[\s:.]+(\d{2})/i;
    const timeMatch = textLower.match(timeRegex);
    
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = parseInt(timeMatch[2], 10);
      timeSelected = true;
    } else {
      // e.g. "saat 16", "saat 9"
      const hourRegex = /saat\s*(\d{1,2})/i;
      const hourMatch = textLower.match(hourRegex);
      if (hourMatch) {
        hour = parseInt(hourMatch[1], 10);
        timeSelected = true;
      } else {
        // e.g. "saat üç", "saat yirmi"
        const textHours: { [key: string]: number } = {
          'bir': 1, 'iki': 2, 'üç': 3, 'uc': 3, 'dört': 4, 'dort': 4, 'beş': 5, 'bes': 5,
          'altı': 6, 'alti': 6, 'yedi': 7, 'sekiz': 8, 'dokuz': 9, 'on': 10,
          'on bir': 11, 'oniki': 12, 'on iki': 12, 'on üç': 13, 'on uc': 13, 'on dört': 14,
          'on dort': 14, 'on beş': 15, 'on bes': 15, 'on altı': 16, 'on alti': 16,
          'on yedi': 17, 'on sekiz': 18, 'on dokuz': 19, 'yirmi': 20, 'yirmi bir': 21,
          'yirmi iki': 22, 'yirmi üç': 23, 'yirmi uc': 23
        };
        for (const [word, val] of Object.entries(textHours)) {
          if (textLower.includes(`saat ${word}`)) {
            hour = val;
            timeSelected = true;
            break;
          }
        }
      }
    }

    if (timeSelected) {
      targetDate.setHours(hour, minute, 0, 0);
      // If we only got time (no date words) and that time has already passed today, assume tomorrow
      if (!dateSelected && targetDate.getTime() < now.getTime()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
    } else {
      // If no time was found, but a date was explicitly matched
      if (dateSelected) {
        targetDate.setHours(9, 0, 0, 0); // Default to 09:00
      } else {
        // Safe default if somehow we got here
        targetDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
      }
    }

    return targetDate;
  }

  /**
   * Helper to check if text contains date words
   */
  private static checkDateIndicators(text: string): boolean {
    const indicators = [
      'bugün', 'bugun', 'yarın', 'yarin', 'öbür gün', 'obur gun', 'ertesi gün', 'ertesi gun',
      'pazartesi', 'salı', 'sali', 'çarşamba', 'carsamba', 'perşembe', 'persembe', 'cuma',
      'cumartesi', 'pazar', 'gün', 'gunu'
    ];
    return indicators.some(ind => text.includes(ind));
  }

  /**
   * Helper to check if text contains time words/indicators
   */
  private static checkTimeIndicators(text: string): boolean {
    if (text.includes('saat')) {
      return true;
    }
    // Check digit time format like "10:00", "16.00"
    const timeFormat = /\b\d{1,2}[:.]\d{2}\b/;
    return timeFormat.test(text);
  }
}
