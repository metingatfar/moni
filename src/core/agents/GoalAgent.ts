import { BaseAgent } from './BaseAgent';
import type { AgentContext } from './AgentContext';
import type { AgentResult } from './AgentResult';

export class GoalAgent extends BaseAgent {
  public id = 'goal_agent';
  public name = 'GoalAgent';
  public description = 'Kullanıcının kısa ve uzun vadeli hedeflerini yönetir.';
  public capabilities = ['create_goal', 'track_goal', 'evaluate_goal'];

  public async canHandle(input: string, _context: AgentContext): Promise<boolean> {
    const text = input.toLowerCase();
    const triggers = ['hedefim', 'hedef', 'istiyorum', 'kiloya düşmek', 'ingilizce çalışmak', 'forma girmek'];
    return triggers.some(t => text.includes(t));
  }

  public async execute(input: string, _context: AgentContext): Promise<AgentResult> {
    const confidence = 0.9;
    const goalText = input.replace(/hedefim|hedef|istiyorum/gi, '').trim();

    // Propose confirmation/creation action
    return this.needsConfirmation(
      `Hedef listenize yeni bir hedef eklemek istediğinizi anladım: "${input}". Bu hedefi onaylıyor musunuz?`,
      confidence,
      [{
        tool: 'goals',
        params: { action: 'create', title: goalText || input }
      }]
    );
  }
}
