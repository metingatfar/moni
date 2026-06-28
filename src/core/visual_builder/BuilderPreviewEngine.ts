import type { BuilderScreen } from './BuilderScreen';

export interface DeviceSpec {
  id: string;
  name: string;
  width: number;
  height: number;
}

export class BuilderPreviewEngine {
  private devices: DeviceSpec[] = [
    { id: 'desktop', name: 'Web Desktop View', width: 1440, height: 900 },
    { id: 'tablet', name: 'iPad Portrait View', width: 768, height: 1024 },
    { id: 'phone', name: 'Mobile Viewport', width: 390, height: 844 }
  ];

  public renderMockPreview(screen: BuilderScreen, deviceId: string): { device: DeviceSpec; scale: number; layoutStatus: string } {
    const dev = this.devices.find(d => d.id === deviceId) || this.devices[2]; // default to mobile
    const scale = screen.viewport.width > dev.width ? dev.width / screen.viewport.width : 1;

    return {
      device: dev,
      scale: parseFloat(scale.toFixed(2)),
      layoutStatus: `Rendered ${screen.components.length} components with custom design tokens on ${dev.name}.`
    };
  }

  public getDevices(): DeviceSpec[] {
    return this.devices;
  }
}
