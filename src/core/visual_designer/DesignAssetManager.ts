export interface DesignAsset {
  id: string;
  name: string;
  type: 'icon' | 'image' | 'font' | 'illustration';
  path: string;
  meta: Record<string, any>;
}

export class DesignAssetManager {
  private assets: Map<string, DesignAsset> = new Map();

  public registerAsset(asset: DesignAsset): void {
    this.assets.set(asset.id, asset);
  }

  public getAsset(id: string): DesignAsset | undefined {
    return this.assets.get(id);
  }

  public getAllAssets(): DesignAsset[] {
    return Array.from(this.assets.values());
  }

  public getByType(type: DesignAsset['type']): DesignAsset[] {
    return this.getAllAssets().filter(a => a.type === type);
  }

  public clear(): void {
    this.assets.clear();
  }
}
