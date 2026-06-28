import type { BuilderComponent } from './BuilderComponent';
import type { BuilderScreen } from './BuilderScreen';

export class DragDropEngine {
  private dragBuffer: BuilderComponent | null = null;

  public dragStart(component: BuilderComponent): void {
    this.dragBuffer = { ...component };
  }

  public dragOver(x: number, y: number): { x: number; y: number } {
    // Return aligned or unmodified x,y coords
    return { x, y };
  }

  public drop(screen: BuilderScreen, x: number, y: number): BuilderComponent | null {
    if (!this.dragBuffer) return null;
    const placed: BuilderComponent = {
      ...this.dragBuffer,
      x,
      y
    };
    screen.components.push(placed);
    this.dragBuffer = null;
    return placed;
  }

  public move(screen: BuilderScreen, componentId: string, newX: number, newY: number): boolean {
    const comp = screen.components.find(c => c.id === componentId);
    if (!comp) return false;
    comp.x = newX;
    comp.y = newY;
    return true;
  }

  public duplicate(screen: BuilderScreen, componentId: string): BuilderComponent | null {
    const comp = screen.components.find(c => c.id === componentId);
    if (!comp) return null;
    const duplicated: BuilderComponent = {
      ...comp,
      id: `${comp.id}_copy_${Date.now()}`,
      x: comp.x + 20,
      y: comp.y + 20
    };
    screen.components.push(duplicated);
    return duplicated;
  }

  public remove(screen: BuilderScreen, componentId: string): boolean {
    const initialLen = screen.components.length;
    screen.components = screen.components.filter(c => c.id !== componentId);
    return screen.components.length < initialLen;
  }
}
