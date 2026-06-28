export interface DockLayout {
  sidebarWidth: number;
  bottomPanelHeight: number;
  splitRatio: number;
  sidebarCollapsed: boolean;
  bottomCollapsed: boolean;
}

export class WorkspaceLayoutManager {
  private layout: DockLayout = {
    sidebarWidth: 260,
    bottomPanelHeight: 220,
    splitRatio: 0.5,
    sidebarCollapsed: false,
    bottomCollapsed: false
  };

  public getLayout(): DockLayout {
    return this.layout;
  }

  public resizeSidebar(width: number): void {
    this.layout.sidebarWidth = Math.max(150, Math.min(500, width));
  }

  public resizeBottomPanel(height: number): void {
    this.layout.bottomPanelHeight = Math.max(100, Math.min(600, height));
  }

  public setSplitRatio(ratio: number): void {
    this.layout.splitRatio = Math.max(0.1, Math.min(0.9, ratio));
  }

  public toggleSidebar(): void {
    this.layout.sidebarCollapsed = !this.layout.sidebarCollapsed;
  }

  public toggleBottomPanel(): void {
    this.layout.bottomCollapsed = !this.layout.bottomCollapsed;
  }
}
