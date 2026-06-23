import { BaseAgent } from './BaseAgent';
import type { AgentContext } from './AgentContext';
import type { AgentResult } from './AgentResult';

export class LearningAgent extends BaseAgent {
  public id = 'learning_agent';
  public name = 'LearningAgent';
  public description = 'Kullanıcının dil öğrenme, kelime ezberleme ve çalışma hedeflerine yardımcı olur.';
  public capabilities = ['vocabulary_quiz', 'study_reminder', 'learning_tips'];

  public async canHandle(input: string, _context: AgentContext): Promise<boolean> {
    const text = input.toLowerCase();
    const triggers = ['çalışalım', 'kelime sor', 'ingilizce çalışalım', 'japonca çalışmak', 'dil öğren', 'ders çalış'];
    return triggers.some(t => text.includes(t));
  }

  public async execute(input: string, _context: AgentContext): Promise<AgentResult> {
    const confidence = 0.95;
    const text = input.toLowerCase();

    if (text.includes('kelime sor')) {
      return this.safeResponse(
        "Harika! Şimdi size ingilizce bir kelime soruyorum: 'Orchestration' kelimesinin Türkçe karşılığı nedir?",
        confidence
      );
    }

    if (text.includes('ingilizce') || text.includes('japonca')) {
      return this.safeResponse(
        "Yeni bir dil çalışmak harika bir zihinsel egzersizdir. Bugün 10 dakikalık kısa bir kelime kartı pratiğiyle başlayabiliriz.",
        confidence
      );
    }

    return this.safeResponse(
      "Öğrenme hedeflerinizi desteklemek için çalışmaya başlamaya hazırım. Hangi konuya odaklanmak istersiniz?",
      confidence
    );
  }
}
