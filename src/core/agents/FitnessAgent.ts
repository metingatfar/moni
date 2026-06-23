import { BaseAgent } from './BaseAgent';
import type { AgentContext } from './AgentContext';
import type { AgentResult } from './AgentResult';

export class FitnessAgent extends BaseAgent {
  public id = 'fitness_agent';
  public name = 'FitnessAgent';
  public description = 'Kullanıcının spor, egzersiz ve hareket planlamalarını yönetir.';
  public capabilities = ['track_exercise', 'recommend_workout', 'suggest_activity'];

  public async canHandle(input: string, _context: AgentContext): Promise<boolean> {
    const text = input.toLowerCase();
    const triggers = ['yürüyüş', 'yürüyüş yapayım', 'yüzme', 'yüzmeye gitsem', 'antrenman planı', 'antrenman', 'spor', 'koşu', 'badminton'];
    return triggers.some(t => text.includes(t));
  }

  public async execute(input: string, context: AgentContext): Promise<AgentResult> {
    const confidence = 0.9;
    const text = input.toLowerCase();

    let recommendation = "Genel kondisyonunuzu korumak için bugün hafif bir yürüyüş planlayabilirsiniz.";
    
    // Customize recommendation slightly based on context
    if (context.lifeSnapshot && context.lifeSnapshot.todayTasksCount > 3) {
      recommendation = "Bugün yoğun bir gün geçiriyorsunuz. Ağır bir antrenman yerine 15 dakikalık hafif esneme hareketleri yapmanızı öneririm.";
    } else if (text.includes('yüzme') || text.includes('yüzmeye')) {
      recommendation = "Yüzmek harika bir tüm vücut antrenmanıdır, kendinizi yormadan keyifli bir seans yapabilirsiniz.";
    } else if (text.includes('yürüyüş')) {
      recommendation = "Açık havada tempolu bir yürüyüş zihninizi açacak ve enerjinizi tazeleyecektir.";
    }

    return this.safeResponse(recommendation, confidence);
  }
}
