export interface BreakpointConfig {
  name: string;
  minWidth: number;
  columns: number;
  gap: string;
  padding: string;
}

export class ResponsiveEngine {
  public getBreakpoints(): BreakpointConfig[] {
    return [
      { name: 'mobile', minWidth: 0, columns: 4, gap: '12px', padding: '16px' },
      { name: 'tablet', minWidth: 640, columns: 8, gap: '16px', padding: '24px' },
      { name: 'laptop', minWidth: 1024, columns: 12, gap: '20px', padding: '32px' },
      { name: 'desktop', minWidth: 1280, columns: 12, gap: '24px', padding: '40px' },
      { name: 'foldable', minWidth: 480, columns: 6, gap: '12px', padding: '16px' }
    ];
  }

  public getAdaptiveLayout(viewportWidth: number): BreakpointConfig {
    const breakpoints = this.getBreakpoints();
    const sorted = [...breakpoints].sort((a, b) => b.minWidth - a.minWidth);
    
    for (const bp of sorted) {
      if (viewportWidth >= bp.minWidth) {
        return bp;
      }
    }
    return breakpoints[0];
  }
}
