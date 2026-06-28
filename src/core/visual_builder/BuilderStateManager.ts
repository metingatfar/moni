import type { BuilderProject } from './BuilderProject';
import type { BuilderScreen } from './BuilderScreen';
import type { BuilderComponent } from './BuilderComponent';

export class BuilderStateManager {
  private currentProject: BuilderProject | null = null;
  private selectedScreenId: string | null = null;
  private selectedComponentId: string | null = null;
  private clipboardComponent: BuilderComponent | null = null;
  private isDirtyState = false;

  public setProject(project: BuilderProject): void {
    this.currentProject = project;
    this.isDirtyState = true;
  }

  public getProject(): BuilderProject | null {
    return this.currentProject;
  }

  public selectScreen(screenId: string): void {
    this.selectedScreenId = screenId;
  }

  public getSelectedScreen(): BuilderScreen | null {
    if (!this.currentProject || !this.selectedScreenId) return null;
    return this.currentProject.screens.find(s => s.screenId === this.selectedScreenId) || null;
  }

  public selectComponent(componentId: string | null): void {
    this.selectedComponentId = componentId;
  }

  public getSelectedComponentId(): string | null {
    return this.selectedComponentId;
  }

  public copyComponent(comp: BuilderComponent): void {
    this.clipboardComponent = { ...comp };
  }

  public pasteComponent(screen: BuilderScreen): BuilderComponent | null {
    if (!this.clipboardComponent) return null;
    const pasted: BuilderComponent = {
      ...this.clipboardComponent,
      id: `${this.clipboardComponent.id}_paste_${Date.now()}`,
      x: this.clipboardComponent.x + 40,
      y: this.clipboardComponent.y + 40
    };
    screen.components.push(pasted);
    this.isDirtyState = true;
    return pasted;
  }

  public isDirty(): boolean {
    return this.isDirtyState;
  }

  public markClean(): void {
    this.isDirtyState = false;
  }
}
