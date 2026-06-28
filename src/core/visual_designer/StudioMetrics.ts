export class StudioMetrics {
  private metrics = {
    projects: 0,
    screens: 0,
    components: 0,
    layouts: 0,
    prototypes: 0,
    exports: 0,
    reviews: 0,
    versions: 0
  };

  public trackProject(): void { this.metrics.projects++; }
  public trackScreen(count = 1): void { this.metrics.screens += count; }
  public trackComponent(count = 1): void { this.metrics.components += count; }
  public trackLayout(): void { this.metrics.layouts++; }
  public trackPrototype(): void { this.metrics.prototypes++; }
  public trackExport(): void { this.metrics.exports++; }
  public trackReview(): void { this.metrics.reviews++; }
  public trackVersion(): void { this.metrics.versions++; }

  public getMetrics() {
    return { ...this.metrics };
  }

  public clear(): void {
    this.metrics = {
      projects: 0,
      screens: 0,
      components: 0,
      layouts: 0,
      prototypes: 0,
      exports: 0,
      reviews: 0,
      versions: 0
    };
  }
}
export const studioMetrics = new StudioMetrics();
