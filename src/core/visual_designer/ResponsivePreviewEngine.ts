export interface PreviewConfig {
  deviceType: 'desktop' | 'laptop' | 'tablet' | 'foldable' | 'phone';
  orientation: 'portrait' | 'landscape';
  width: number;
  height: number;
}

export class ResponsivePreviewEngine {
  private viewports: PreviewConfig[] = [
    { deviceType: 'desktop', orientation: 'landscape', width: 1920, height: 1080 },
    { deviceType: 'laptop', orientation: 'landscape', width: 1366, height: 768 },
    { deviceType: 'tablet', orientation: 'portrait', width: 768, height: 1024 },
    { deviceType: 'foldable', orientation: 'portrait', width: 280, height: 653 },
    { deviceType: 'phone', orientation: 'portrait', width: 390, height: 844 }
  ];

  public getViewports(): PreviewConfig[] {
    return this.viewports;
  }

  public getViewportForDevice(deviceType: PreviewConfig['deviceType'], orientation: PreviewConfig['orientation']): PreviewConfig | undefined {
    return this.viewports.find(v => v.deviceType === deviceType && v.orientation === orientation);
  }
}
