export interface CanvasLayer {
  id: string;
  name: string;
  type: 'frame' | 'group' | 'text' | 'image' | 'vector';
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  locked: boolean;
  parentId?: string;
}

export class DesignCanvas {
  private layers: Map<string, CanvasLayer> = new Map();

  public addLayer(layer: CanvasLayer): void {
    this.layers.set(layer.id, layer);
  }

  public getLayers(): CanvasLayer[] {
    return Array.from(this.layers.values());
  }

  public getLayersByParent(parentId: string): CanvasLayer[] {
    return this.getLayers().filter(l => l.parentId === parentId);
  }

  public moveLayer(id: string, x: number, y: number): void {
    const layer = this.layers.get(id);
    if (layer && !layer.locked) {
      layer.x = x;
      layer.y = y;
    }
  }

  public clear(): void {
    this.layers.clear();
  }
}
