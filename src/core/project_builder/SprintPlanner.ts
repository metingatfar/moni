import type { SprintDefinition } from './ExecutionPackage';

export class SprintPlanner {
  public planSprints(userInput: string): SprintDefinition[] {
    const sprints: SprintDefinition[] = [];
    const lower = userInput.toLowerCase();

    sprints.push({
      id: 'sprint-1',
      name: 'Sprint 1: Core Foundation & Auth',
      durationDays: 14,
      features: ['Authentication Service', 'Database Schemas Setup', 'Bootstrap layout configurations']
    });

    sprints.push({
      id: 'sprint-2',
      name: 'Sprint 2: APIs & Dashboard Views',
      durationDays: 14,
      features: ['Users Profile Routes API', 'Dashboard Presentation Screen', 'Component Card elements']
    });

    const sprint3Features = ['Reports Exports', 'Unit Testing Integration', 'Docker Build Pipeline scripts'];
    if (lower.includes('fitness') || lower.includes('health')) {
      sprint3Features.push('Workout recommendation LLM context', 'Calorie macro-nutrients logging API');
    } else if (lower.includes('erp') || lower.includes('enterprise')) {
      sprint3Features.push('Inventory transactions ledger', 'Vendor supplier tracking views');
    }

    sprints.push({
      id: 'sprint-3',
      name: 'Sprint 3: Business Logic & Delivery Ready',
      durationDays: 14,
      features: sprint3Features
    });

    return sprints;
  }
}
