import type { BuilderComponent } from './BuilderComponent';

export class ComponentPlacementEngine {
  private gridSize = 8; // standard 8px grid spacing

  public snapToGrid(x: number, y: number): { x: number; y: number } {
    const snappedX = Math.round(x / this.gridSize) * this.gridSize;
    const snappedY = Math.round(y / this.gridSize) * this.gridSize;
    return { x: snappedX, y: snappedY };
  }

  public alignComponent(
    comp: BuilderComponent,
    type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom',
    containerDim: { width: number; height: number },
    widthVal = 100,
    heightVal = 40
  ): void {
    if (type === 'left') {
      comp.x = 0;
    } else if (type === 'center') {
      comp.x = Math.round((containerDim.width - widthVal) / 2);
    } else if (type === 'right') {
      comp.x = containerDim.width - widthVal;
    } else if (type === 'top') {
      comp.y = 0;
    } else if (type === 'middle') {
      comp.y = Math.round((containerDim.height - heightVal) / 2);
    } else if (type === 'bottom') {
      comp.y = containerDim.height - heightVal;
    }
  }

  public sortLayers(components: BuilderComponent[]): BuilderComponent[] {
    // Return sorted list based on hierarchy or Y/X layout positioning
    return [...components].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
  }
}
