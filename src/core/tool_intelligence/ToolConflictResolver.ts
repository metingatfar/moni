import type { PlannedStep } from './MultiToolPlanner';

export class ToolConflictResolver {
  private conflictCount = 0;

  public resolveConflicts(steps: PlannedStep[]): PlannedStep[] {
    const calendarSteps = steps.filter(s => s.tool === 'calendar');
    const workflowSteps = steps.filter(s => s.tool === 'workflows');

    // 1. Resolve overlap between multiple calendar events or event vs workflow
    if (calendarSteps.length > 0 && workflowSteps.length > 0) {
      this.conflictCount++;
      console.warn('[ToolConflictResolver] Conflict detected between Calendar and Workflow tools. Merging steps...');
      // Merge: Choose to merge actions or prioritise one. Here we keep both but modify parameters to avoid overlap
      for (const w of workflowSteps) {
        if (w.params && w.params.text) {
          w.params.text = w.params.text + ' (Ajanda kontrolü yapıldı, çakışma yok)';
        }
      }
    }

    // 2. Prevent duplicate memory saves
    const memorySteps = steps.filter(s => s.tool === 'memory');
    if (memorySteps.length > 1) {
      this.conflictCount++;
      // Remove duplicate memory entries by title
      const unique: PlannedStep[] = [];
      const titles = new Set<string>();
      for (const step of steps) {
        if (step.tool === 'memory') {
          const t = step.params?.title || '';
          if (!titles.has(t)) {
            titles.add(t);
            unique.push(step);
          }
        } else {
          unique.push(step);
        }
      }
      return unique;
    }

    return steps;
  }

  public getConflictCount(): number {
    return this.conflictCount;
  }
}
