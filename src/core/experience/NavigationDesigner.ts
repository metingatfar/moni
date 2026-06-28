export interface NavigationNode {
  id: string;
  label: string;
  route: string;
  icon?: string;
}

export class NavigationDesigner {
  public getLeftRailMenu(): NavigationNode[] {
    return [
      { id: 'nav-home', label: 'MONI HOME', route: '/home', icon: 'home' },
      { id: 'nav-studio', label: 'DESIGN STUDIO', route: '/studio', icon: 'palette' },
      { id: 'nav-builder', label: 'VISUAL BUILDER', route: '/builder', icon: 'layout' },
      { id: 'nav-ide', label: 'IDE WORKSPACE', route: '/ide', icon: 'code' },
      { id: 'nav-chat', label: 'AI CO-PILOT', route: '/chat', icon: 'message' }
    ];
  }

  public getQuickActions(): string[] {
    return [
      'Ctrl + P : Command Palette',
      'Ctrl + Shift + F : Global Search',
      'Ctrl + ` : Show TerminalConsole'
    ];
  }
}
export const navigationDesigner = new NavigationDesigner();
export default navigationDesigner;
