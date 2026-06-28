export interface PreviewTarget {
  name: string;
  width: number;
  height: number;
  ua: string;
}

export class LivePreviewManager {
  private targets: Record<string, PreviewTarget> = {
    web: { name: 'Web Desktop', width: 1440, height: 900, ua: 'Chrome Desktop' },
    android: { name: 'Android View', width: 360, height: 740, ua: 'Pixel 7 Mobile' },
    ios: { name: 'iPhone View', width: 390, height: 844, ua: 'iPhone 14 Mobile' },
    tablet: { name: 'Tablet View', width: 768, height: 1024, ua: 'iPad Portrait' }
  };

  public getTarget(type: string): PreviewTarget | undefined {
    return this.targets[type.toLowerCase()];
  }

  public getAvailableTargets(): string[] {
    return Object.keys(this.targets);
  }
}
