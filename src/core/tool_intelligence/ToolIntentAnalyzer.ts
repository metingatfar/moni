export interface ToolIntent {
  intent: string;
  confidence: number;
  extractedParams: Record<string, any>;
}

export class ToolIntentAnalyzer {
  public analyze(input: string): ToolIntent {
    const lower = input.toLowerCase().trim();
    
    // 1. Calendar Intents
    if (
      lower.includes('toplantı oluştur') || 
      lower.includes('toplanti olustur') || 
      lower.includes('randevu planla') || 
      lower.includes('görüşme planla') || 
      lower.includes('toplantı planla') ||
      (lower.includes('saat') && lower.includes('toplantı'))
    ) {
      // Simple regex extraction for date/time/title details
      let title = 'Toplantı';
      if (lower.includes('toplantısı')) {
        const parts = input.split(/toplantısı/i);
        title = parts[0].trim() + ' Toplantısı';
      }
      return {
        intent: 'create_event',
        confidence: 0.95,
        extractedParams: { title, type: 'meeting' }
      };
    }

    // 2. Workflow Intents
    if (
      (lower.includes('her') && (lower.includes('sor') || lower.includes('hatırlat') || lower.includes('motive et') || lower.includes('oku'))) ||
      lower.includes('kilomu sor') || 
      lower.includes('ilaçlarımı hatırlat') || 
      lower.includes('otomatik iş akışı')
    ) {
      return {
        intent: 'recurring_workflow',
        confidence: 0.9,
        extractedParams: { text: input }
      };
    }

    // 3. Goal Intents
    if (
      lower.includes('hedefim') || 
      lower.includes('hedef oluştur') || 
      lower.includes('hedef olustur') || 
      lower.includes('milestone') || 
      lower.includes('hedefe ulaşmak')
    ) {
      return {
        intent: 'goal',
        confidence: 0.92,
        extractedParams: { text: input }
      };
    }

    // 4. Reminder Intents
    if (
      lower.includes('hatırlat') || 
      lower.includes('hatirlat') || 
      lower.includes('alarm kur')
    ) {
      return {
        intent: 'create_reminder',
        confidence: 0.88,
        extractedParams: { text: input }
      };
    }

    // 5. Memory Intents
    if (
      lower.includes('bunu hatırla') || 
      lower.includes('unutma') || 
      lower.includes('aklında tut') || 
      lower.includes('hafızana al') || 
      lower.includes('hafızaya kaydet')
    ) {
      return {
        intent: 'save_memory',
        confidence: 0.95,
        extractedParams: { text: input }
      };
    }

    // 6. Internet Research Intents
    if (
      lower.includes('internette araştır') || 
      lower.includes('google\'da ara') || 
      lower.includes('internetten bak') || 
      lower.includes('güncel durum nedir') || 
      lower.includes('son dakika') ||
      lower.includes('araştır')
    ) {
      return {
        intent: 'research',
        confidence: 0.9,
        extractedParams: { query: input }
      };
    }

    return {
      intent: 'general_chat',
      confidence: 0.5,
      extractedParams: {}
    };
  }
}
