import { BaseAgent } from './BaseAgent';
import type { AgentContext } from './AgentContext';
import type { AgentResult } from './AgentResult';

export class HealthAgent extends BaseAgent {
  public id = 'health_agent';
  public name = 'HealthAgent';
  public description = 'Kullanıcının sağlık parametrelerini ve ilaç hatırlatmalarını yönetir.';
  public capabilities = ['track_health', 'log_symptoms', 'medication_reminders'];

  public async canHandle(input: string, _context: AgentContext): Promise<boolean> {
    const text = input.toLowerCase();
    const triggers = ['yorgunum', 'yorgun', 'tansiyon', 'tansiyonumu kaydet', 'ilaç', 'ilac', 'eczane', 'doktor'];
    return triggers.some(t => text.includes(t)) && !text.includes('hatırlat') && !text.includes('hatirlat');
  }

  public async execute(input: string, _context: AgentContext): Promise<AgentResult> {
    const confidence = 0.95;
    const text = input.toLowerCase();

    if (text.includes('yorgun')) {
      return this.safeResponse(
        "Yorgun olduğunuzu belirttiniz. Kendinizi çok yormadan dinlenmeye çalışın. Eğer geçmeyen veya ciddi bir halsizliğiniz varsa lütfen hekiminize danışın.",
        confidence
      );
    }

    if (text.includes('tansiyon')) {
      // Find systolic/diastolic BP numbers if any
      const bpMatch = input.match(/(\d{2,3})\s*[\/\\-]\s*(\d{2,3})/);
      if (bpMatch) {
        return this.safeResponse(
          `Tansiyon değerinizi ${bpMatch[1]}/${bpMatch[2]} olarak kaydettim. Sağlıklı seviyeleri takip etmek önemlidir. Olağandışı durumlarda doktorunuza danışınız.`,
          confidence
        );
      }
      return this.safeResponse(
        "Tansiyon değerinizi kaydetmek isterseniz lütfen 120/80 formatında belirtiniz.",
        confidence
      );
    }

    if (text.includes('ilaç') || text.includes('ilac')) {
      return this.safeResponse(
        "İlaç düzeninizi yakından takip ediyorum. İlaçlarınızı saatinde ve doktorunuzun önerdiği şekilde kullanmayı ihmal etmeyin.",
        confidence
      );
    }

    return this.safeResponse(
      "Sağlık durumunuzla ilgili verileri güvenle saklıyorum. Kendinizi iyi hissetmediğinizde lütfen bir uzmana danışmayı unutmayın.",
      confidence
    );
  }
}
