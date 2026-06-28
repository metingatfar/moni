import type { BuilderComponent } from './BuilderComponent';

export interface AlignmentSuggestion {
  componentId: string;
  suggestedX?: number;
  suggestedY?: number;
  reason: string;
}

export class SmartAlignmentEngine {
  public suggestAlignments(components: BuilderComponent[]): AlignmentSuggestion[] {
    const suggestions: AlignmentSuggestion[] = [];
    if (components.length < 2) return suggestions;

    // Check if components are near-aligned (e.g. within 5px offset)
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const c1 = components[i];
        const c2 = components[j];

        const xDiff = Math.abs(c1.x - c2.x);
        if (xDiff > 0 && xDiff <= 5) {
          suggestions.push({
            componentId: c2.id,
            suggestedX: c1.x,
            reason: `Align horizontally with ${c1.id} (offset was ${xDiff}px)`
          });
        }

        const yDiff = Math.abs(c1.y - c2.y);
        if (yDiff > 0 && yDiff <= 5) {
          suggestions.push({
            componentId: c2.id,
            suggestedY: c1.y,
            reason: `Align vertically with ${c1.id} (offset was ${yDiff}px)`
          });
        }
      }
    }

    return suggestions;
  }

  public distributeEvenly(components: BuilderComponent[], direction: 'horizontal' | 'vertical'): void {
    if (components.length < 3) return;

    // Sort components by primary coordinate
    const sorted = [...components].sort((a, b) => (direction === 'horizontal' ? a.x - b.x : a.y - b.y));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    if (direction === 'horizontal') {
      const totalDist = last.x - first.x;
      const step = totalDist / (sorted.length - 1);
      for (let i = 1; i < sorted.length - 1; i++) {
        sorted[i].x = Math.round(first.x + i * step);
      }
    } else {
      const totalDist = last.y - first.y;
      const step = totalDist / (sorted.length - 1);
      for (let i = 1; i < sorted.length - 1; i++) {
        sorted[i].y = Math.round(first.y + i * step);
      }
    }
  }
}
