import type { BuilderComponent } from './BuilderComponent';

export interface LayerMetadata {
  componentId: string;
  visible: boolean;
  locked: boolean;
  groupName: string | null;
}

export class LayersManager {
  private layers: Map<string, LayerMetadata> = new Map();

  public registerComponent(comp: BuilderComponent): void {
    if (!this.layers.has(comp.id)) {
      this.layers.set(comp.id, {
        componentId: comp.id,
        visible: true,
        locked: false,
        groupName: null
      });
    }
  }

  public toggleVisibility(componentId: string): boolean {
    const meta = this.layers.get(componentId);
    if (!meta) return false;
    meta.visible = !meta.visible;
    return meta.visible;
  }

  public toggleLock(componentId: string): boolean {
    const meta = this.layers.get(componentId);
    if (!meta) return false;
    meta.locked = !meta.locked;
    return meta.locked;
  }

  public groupComponents(componentIds: string[], groupName: string): void {
    componentIds.forEach(id => {
      const meta = this.layers.get(id);
      if (meta) {
        meta.groupName = groupName;
      }
    });
  }

  public getMetadata(componentId: string): LayerMetadata | undefined {
    return this.layers.get(componentId);
  }

  public getLayersCount(): number {
    return this.layers.size;
  }
}
