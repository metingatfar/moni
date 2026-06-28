export interface StudioWorkspaceState {
  activeProjectName: string;
  openFiles: string[];
  activeTab: string;
  editorCursorLine: number;
  terminalCommand: string;
  previewPlatform: 'web' | 'android' | 'ios' | 'tablet';
  problemsCount: number;
}

export class StudioWorkspace {
  private state: StudioWorkspaceState = {
    activeProjectName: 'Moni Enterprise App',
    openFiles: ['src/core/container/Bootstrap.ts', 'src/presentation/MoniDashboard.tsx'],
    activeTab: 'src/presentation/MoniDashboard.tsx',
    editorCursorLine: 1,
    terminalCommand: 'npm run dev',
    previewPlatform: 'web',
    problemsCount: 0
  };

  public getState(): StudioWorkspaceState {
    return this.state;
  }

  public openFile(filePath: string): void {
    if (!this.state.openFiles.includes(filePath)) {
      this.state.openFiles.push(filePath);
    }
    this.state.activeTab = filePath;
  }

  public setCursor(line: number): void {
    this.state.editorCursorLine = Math.max(1, line);
  }

  public setPreviewPlatform(platform: StudioWorkspaceState['previewPlatform']): void {
    this.state.previewPlatform = platform;
  }

  public updateProblemsCount(count: number): void {
    this.state.problemsCount = Math.max(0, count);
  }
}

export const studioWorkspace = new StudioWorkspace();
export default studioWorkspace;
