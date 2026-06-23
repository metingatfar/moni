import type { AgentContext } from '../agents/AgentContext';
import { agentRegistry } from '../agents/AgentRegistry';

export class AgentCoordinator {
  public determineRequiredAgents(input: string, _context: AgentContext): string[] {
    const text = input.toLowerCase();
    const required = new Set<string>();

    // 1. Goal Agent triggers
    if (text.includes('hedef') || text.includes('kilo') || text.includes('milestone') || text.includes('başarı') || text.includes('plan')) {
      required.add('goal_agent');
    }

    // 2. Health Agent triggers
    if (text.includes('sağlık') || text.includes('yorgun') || text.includes('ilaç') || text.includes('hastalık') || text.includes('uyku') || text.includes('kilo')) {
      required.add('health_agent');
    }

    // 3. Fitness Agent triggers
    if (text.includes('spor') || text.includes('yürüyüş') || text.includes('koşu') || text.includes('egzersiz') || text.includes('antrenman') || text.includes('yüzme') || text.includes('badminton') || text.includes('kilo')) {
      required.add('fitness_agent');
    }

    // 4. Notification / Alert Agent triggers
    if (text.includes('hatırlat') || text.includes('bildirim') || text.includes('alarm') || text.includes('uyarı') || text.includes('sabah') || text.includes('akşam')) {
      required.add('notification_agent');
    }

    // 5. Learning Agent triggers
    if (text.includes('öğren') || text.includes('oku') || text.includes('kitap') || text.includes('ders') || text.includes('kurs') || text.includes('makale')) {
      required.add('learning_agent');
    }

    // Default fallback: if no keyword matches, assign goal_agent and health_agent as defaults
    if (required.size === 0) {
      required.add('goal_agent');
      required.add('health_agent');
    }

    // Verify against currently registered agents
    const registeredIds = new Set(agentRegistry.getAgents().map(a => a.id));
    return Array.from(required).filter(id => registeredIds.has(id));
  }
}
