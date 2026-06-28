export class VisualBuilderMetrics {
  public sessions = 0;
  public screensCreated = 0;
  public componentsPlaced = 0;
  public dragEvents = 0;
  public commandsParsed = 0;
  public undoRedoActions = 0;
  public previewRuns = 0;
  public exportPlans = 0;

  public incrementSession(): void { this.sessions++; }
  public incrementScreen(): void { this.screensCreated++; }
  public incrementComponent(): void { this.componentsPlaced++; }
  public incrementDrag(): void { this.dragEvents++; }
  public incrementCommand(): void { this.commandsParsed++; }
  public incrementUndoRedo(): void { this.undoRedoActions++; }
  public incrementPreview(): void { this.previewRuns++; }
  public incrementExport(): void { this.exportPlans++; }

  public getSummary() {
    return {
      sessions: this.sessions,
      screensCreated: this.screensCreated,
      componentsPlaced: this.componentsPlaced,
      dragEvents: this.dragEvents,
      commandsParsed: this.commandsParsed,
      undoRedoActions: this.undoRedoActions,
      previewRuns: this.previewRuns,
      exportPlans: this.exportPlans
    };
  }
}
export const visualBuilderMetrics = new VisualBuilderMetrics();
export default visualBuilderMetrics;
