export interface VisualAction {
  id: string;
  name: string;
  undoFn: () => void;
  redoFn: () => void;
}

export class UndoRedoManager {
  private undoStack: VisualAction[] = [];
  private redoStack: VisualAction[] = [];

  public executeAction(action: VisualAction): void {
    action.redoFn();
    this.undoStack.push(action);
    this.redoStack = []; // clear redo stack on new action
  }

  public undo(): boolean {
    const action = this.undoStack.pop();
    if (!action) return false;
    action.undoFn();
    this.redoStack.push(action);
    return true;
  }

  public redo(): boolean {
    const action = this.redoStack.pop();
    if (!action) return false;
    action.redoFn();
    this.undoStack.push(action);
    return true;
  }

  public getHistoryNames(): string[] {
    return this.undoStack.map(a => a.name);
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
