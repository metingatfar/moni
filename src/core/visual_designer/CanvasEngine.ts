export interface CanvasViewport {
  zoom: number;
  panX: number;
  panY: number;
  rulersEnabled: boolean;
  snappingDistance: number;
}

export class CanvasEngine {
  private viewport: CanvasViewport = {
    zoom: 1.0,
    panX: 0,
    panY: 0,
    rulersEnabled: true,
    snappingDistance: 8 // default 8px grids
  };

  public getViewport(): CanvasViewport {
    return this.viewport;
  }

  public setZoom(zoom: number): void {
    this.viewport.zoom = Math.max(0.1, Math.min(5.0, zoom));
  }

  public pan(dx: number, dy: number): void {
    this.viewport.panX += dx;
    this.viewport.panY += dy;
  }

  public snap(value: number): number {
    return Math.round(value / this.viewport.snappingDistance) * this.viewport.snappingDistance;
  }
}
