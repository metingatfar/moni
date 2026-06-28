export type PanelLayoutType =
  | 'single'
  | 'split'
  | 'triple'
  | 'ide'
  | 'studio'
  | 'presentation';

export interface ViewportConstraint {
  id: string;
  minWidth: number;
  columnsCount: number;
}

export class WorkspaceLayouts {
  public getLayoutGrid(type: PanelLayoutType): string[] {
    switch (type) {
      case 'single':
        return ['100%'];
      case 'split':
        return ['50%', '50%'];
      case 'triple':
        return ['20%', '60%', '20%'];
      case 'ide':
        return ['15%', '60%', '25%']; // Left rail + editor + Right AI panel
      case 'studio':
        return ['20%', '55%', '25%'];
      default:
        return ['100%'];
    }
  }

  public getResponsiveViewports(): ViewportConstraint[] {
    return [
      { id: 'phone', minWidth: 320, columnsCount: 1 },
      { id: 'tablet', minWidth: 768, columnsCount: 2 },
      { id: 'desktop', minWidth: 1024, columnsCount: 3 },
      { id: 'ultrawide', minWidth: 1440, columnsCount: 4 }
    ];
  }
}
export const workspaceLayouts = new WorkspaceLayouts();
export default workspaceLayouts;
