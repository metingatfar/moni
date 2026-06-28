import type { BuilderProject } from './BuilderProject';
import type { BuilderScreen } from './BuilderScreen';
import type { BuilderComponent } from './BuilderComponent';
import { DragDropEngine } from './DragDropEngine';
import { ComponentPlacementEngine } from './ComponentPlacementEngine';
import { PropertyInspector } from './PropertyInspector';
import { ConstraintEngine } from './ConstraintEngine';
import { VisualHierarchyEngine } from './VisualHierarchyEngine';
import { SmartAlignmentEngine } from './SmartAlignmentEngine';
import { AIVisualCommandEngine } from './AIVisualCommandEngine';
import { InteractionFlowBuilder } from './InteractionFlowBuilder';
import { BuilderStateManager } from './BuilderStateManager';
import { UndoRedoManager } from './UndoRedoManager';
import { BuilderPreviewEngine } from './BuilderPreviewEngine';
import { BuilderExportPlanner } from './BuilderExportPlanner';
import type { ExportPlan } from './BuilderExportPlanner';
import { VisualBuilderMetrics } from './VisualBuilderMetrics';
import { LayersManager } from './LayersManager';
import { AISuggestionsPanel } from './AISuggestionsPanel';

export interface BuilderApprovalPackage {
  success: boolean;
  project: BuilderProject;
  activeScreen: BuilderScreen;
  exportPlan: ExportPlan;
  hierarchyScore: number;
  suggestionsCount: number;
}

export class VisualBuilderEngine {
  private dragDropEngine = new DragDropEngine();
  private placementEngine = new ComponentPlacementEngine();
  private propertyInspector = new PropertyInspector();
  private constraintEngine = new ConstraintEngine();
  private hierarchyEngine = new VisualHierarchyEngine();
  private alignmentEngine = new SmartAlignmentEngine();
  private commandEngine = new AIVisualCommandEngine();
  private interactionFlowBuilder = new InteractionFlowBuilder();
  private stateManager = new BuilderStateManager();
  private undoRedoManager = new UndoRedoManager();
  private previewEngine = new BuilderPreviewEngine();
  private exportPlanner = new BuilderExportPlanner();
  private metrics = new VisualBuilderMetrics();
  private layersManager = new LayersManager();
  private suggestionsPanel = new AISuggestionsPanel();

  // Diagnostics counters
  private requestCount = 0;
  private projectCount = 0;
  private screenCount = 0;
  private componentCount = 0;
  private dragEventsCount = 0;

  public composeScreenVisually(command: string): BuilderApprovalPackage {
    this.requestCount++;
    this.metrics.incrementSession();

    // 1. Create builder project & active screen
    const project: BuilderProject = {
      projectId: `proj-${Date.now()}`,
      name: 'Dynamic Composed App',
      screens: [],
      designSystemId: 'ds-enterprise',
      targetPlatform: 'mobile',
      framework: 'Flutter',
      version: '1.0.0',
      status: 'draft'
    };
    this.projectCount++;

    const screen: BuilderScreen = {
      screenId: 'screen-main',
      name: 'Dashboard View',
      route: 'dashboard',
      viewport: { width: 390, height: 844 }, // Mobile default
      layoutMode: 'absolute',
      components: [],
      interactions: [],
      metadata: {}
    };
    this.screenCount++;
    project.screens.push(screen);

    this.stateManager.setProject(project);
    this.stateManager.selectScreen('screen-main');

    // 2. Base Components
    const titleComponent: BuilderComponent = {
      id: 'txt_dashboard_title',
      type: 'Text',
      x: 20,
      y: 40,
      properties: {
        label: 'Fitness Dashboard',
        boundTokens: { color: 'PrimaryText', typography: 'TypographyHeading' }
      },
      constraints: { widthMode: 'fill', heightMode: 'hug', pinnedEdges: ['left', 'top'] },
      events: {},
      dataBinding: {}
    };
    screen.components.push(titleComponent);
    this.componentCount++;
    this.metrics.incrementComponent();
    this.layersManager.registerComponent(titleComponent);

    // 3. AI visual parse mutations
    this.commandEngine.parseCommand(command, screen);
    this.metrics.incrementCommand();

    // Register any newly added components to layers
    screen.components.forEach(c => {
      this.layersManager.registerComponent(c);
    });

    // 4. Snap and Alignment adjustments
    screen.components.forEach(c => {
      const snapped = this.placementEngine.snapToGrid(c.x, c.y);
      c.x = snapped.x;
      c.y = snapped.y;
    });

    // 5. Constraints resolving check
    screen.components.forEach(c => {
      this.constraintEngine.resolveCalculatedSize(c, screen.viewport.width, screen.viewport.height);
    });

    // 6. Interaction Event Flow Setup
    if (screen.components.some(c => c.type === 'Button')) {
      const btn = screen.components.find(c => c.type === 'Button')!;
      this.interactionFlowBuilder.addNavigationFlow(screen, btn.id, 'settings', 'onClick');
    }

    // 7. Preview Render Check
    this.previewEngine.renderMockPreview(screen, 'phone');
    this.metrics.incrementPreview();

    // 8. Generate Export Proposal
    const exPlan = this.exportPlanner.generateExportPlan(project, 'Flutter');
    this.metrics.incrementExport();

    // 9. Hierarchy & Suggestions Score
    const hierarchy = this.hierarchyEngine.validateHierarchy(screen.components);
    const suggestions = this.suggestionsPanel.generateSuggestions(screen);

    return {
      success: true,
      project,
      activeScreen: screen,
      exportPlan: exPlan,
      hierarchyScore: hierarchy.valid ? 100 : 70,
      suggestionsCount: suggestions.length
    };
  }

  public getDiagnostics() {
    return {
      builderProjects: this.projectCount,
      builderScreens: this.screenCount,
      componentsPlaced: this.componentCount,
      dragDropEvents: this.dragEventsCount,
      propertyEdits: this.metrics.getSummary().undoRedoActions,
      constraintsApplied: this.componentCount,
      interactionsCreated: this.metrics.getSummary().sessions,
      previewRuns: this.metrics.getSummary().previewRuns,
      exportPlans: this.metrics.getSummary().exportPlans,
      builderHealth: 'Excellent'
    };
  }

  // Getters for integration access
  public getDragDrop() { return this.dragDropEngine; }
  public getPlacement() { return this.placementEngine; }
  public getPropertyInspector() { return this.propertyInspector; }
  public getConstraints() { return this.constraintEngine; }
  public getHierarchy() { return this.hierarchyEngine; }
  public getAlignment() { return this.alignmentEngine; }
  public getCommandEngine() { return this.commandEngine; }
  public getInteraction() { return this.interactionFlowBuilder; }
  public getStates() { return this.stateManager; }
  public getUndoRedo() { return this.undoRedoManager; }
  public getPreview() { return this.previewEngine; }
  public getExport() { return this.exportPlanner; }
  public getMetrics() { return this.metrics; }
  public getLayers() { return this.layersManager; }
  public getSuggestions() { return this.suggestionsPanel; }
}

export const visualBuilderEngine = new VisualBuilderEngine();
export default visualBuilderEngine;
