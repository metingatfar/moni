import { CanvasEngine } from './CanvasEngine';
import { DesignCanvas } from './DesignCanvas';
import { ScreenComposer } from './ScreenComposer';
import { ComponentPalette } from './ComponentPalette';
import { SmartLayoutEngine } from './SmartLayoutEngine';
import { PrototypeEngine } from './PrototypeEngine';
import { DesignAssetManager } from './DesignAssetManager';
import { StyleTokenManager } from './StyleTokenManager';
import { ResponsivePreviewEngine } from './ResponsivePreviewEngine';
import { ExportPlanner } from './ExportPlanner';
import { VersionHistoryEngine } from './VersionHistoryEngine';
import { CollaborationWorkspace } from './CollaborationWorkspace';
import { DesignReviewBoard } from './DesignReviewBoard';
import { studioMetrics } from './StudioMetrics';
import type { DesignProject } from './DesignProject';

export interface VisualStudioPackage {
  project: DesignProject;
  viewport: any;
  layers: any[];
  screensComposed: any[];
  componentsList: any[];
  layoutConstraints: any;
  assetCount: number;
  connections: any[];
  responsiveViewports: any[];
  reviewResult: any;
  exportPlan: any;
  version: string;
}

export class VisualDesignerStudio {
  private canvasEngine = new CanvasEngine();
  private designCanvas = new DesignCanvas();
  private screenComposer = new ScreenComposer();
  private componentPalette = new ComponentPalette();
  private smartLayoutEngine = new SmartLayoutEngine();
  private prototypeEngine = new PrototypeEngine();
  private designAssetManager = new DesignAssetManager();
  private styleTokenManager = new StyleTokenManager();
  private responsivePreviewEngine = new ResponsivePreviewEngine();
  private exportPlanner = new ExportPlanner();
  private versionHistoryEngine = new VersionHistoryEngine();
  private collaborationWorkspace = new CollaborationWorkspace();
  private designReviewBoard = new DesignReviewBoard();

  // Diagnostics counters
  private designProjects = 0;
  private screensCount = 0;
  private componentsCount = 0;
  private layoutsCount = 0;
  private assetsCount = 0;
  private prototypesCount = 0;
  private versionsCount = 0;
  private reviewsCount = 0;
  private exportsCount = 0;

  private activeProjects: Map<string, VisualStudioPackage> = new Map();

  public createDesignProject(userInput: string): VisualStudioPackage {
    this.designProjects++;
    studioMetrics.trackProject();

    const projectId = `proj-designer-${Date.now()}`;
    const lower = userInput.toLowerCase();

    // Determine platform
    let targetPlatform: DesignProject['targetPlatform'] = 'desktop';
    if (lower.includes('mobile') || lower.includes('phone') || lower.includes('ios')) {
      targetPlatform = 'phone';
    } else if (lower.includes('tablet')) {
      targetPlatform = 'tablet';
    } else if (lower.includes('foldable')) {
      targetPlatform = 'foldable';
    }

    // Determine framework
    let targetFramework: DesignProject['targetFramework'] = 'React';
    if (lower.includes('flutter')) {
      targetFramework = 'Flutter';
    } else if (lower.includes('react native')) {
      targetFramework = 'React Native';
    } else if (lower.includes('vue')) {
      targetFramework = 'Vue';
    } else if (lower.includes('angular')) {
      targetFramework = 'Angular';
    }

    const project: DesignProject = {
      id: projectId,
      name: lower.includes('fitness') ? 'Fitness Application Plan' : 'Moni Enterprise Workspace',
      screens: ['Dashboard', 'Profile', 'Settings'],
      designSystem: 'Moni Studio Premium Tokens',
      targetPlatform,
      targetFramework,
      metadata: {
        creator: 'MONI Visual AI',
        createdTimestamp: new Date().toISOString()
      },
      version: '1.0.0'
    };

    // 1. Canvas setup
    this.canvasEngine.setZoom(1.2);
    const viewport = this.canvasEngine.getViewport();

    // 2. Layers setup
    this.designCanvas.clear();
    this.designCanvas.addLayer({
      id: 'layer-root-01',
      name: 'Main viewport container',
      type: 'frame',
      x: 0,
      y: 0,
      width: 1440,
      height: 900,
      visible: true,
      locked: false
    });
    const layers = this.designCanvas.getLayers();

    // 3. Screen composition
    const screensComposed = project.screens.map(s => this.screenComposer.composeScreen(s, 'dashboard template'));
    this.screensCount += screensComposed.length;
    studioMetrics.trackScreen(screensComposed.length);

    // 4. Component palette indexing
    const componentsList = this.componentPalette.getComponents();
    this.componentsCount += componentsList.length;
    studioMetrics.trackComponent(componentsList.length);

    // 5. Layout configurations
    const layoutConstraints = this.smartLayoutEngine.arrangeComponents(viewport.zoom * 1000, componentsList.length);
    this.layoutsCount++;
    studioMetrics.trackLayout();

    // 6. Assets managers indexing
    this.designAssetManager.clear();
    this.designAssetManager.registerAsset({
      id: 'asset-icon-home',
      name: 'Home vector icon',
      type: 'icon',
      path: '/assets/icons/home.svg',
      meta: { size: '24x24' }
    });
    this.designAssetManager.registerAsset({
      id: 'asset-icon-search',
      name: 'Search vector icon',
      type: 'icon',
      path: '/assets/icons/search.svg',
      meta: { size: '24x24' }
    });
    this.assetsCount += 2;

    // 7. Prototyping navigation connections
    this.prototypeEngine.clear();
    this.prototypeEngine.connect({
      sourceScreenId: 'screen-dashboard',
      targetScreenId: 'screen-settings',
      triggerEvent: 'click',
      transitionEffect: 'slide-left',
      durationMs: 300
    });
    const connections = this.prototypeEngine.getConnections();
    this.prototypesCount += connections.length;
    studioMetrics.trackPrototype();

    // 8. Responsive Previews configuration
    const responsiveViewports = this.responsivePreviewEngine.getViewports();

    // 9. Version History checkpoints
    this.versionHistoryEngine.clear();
    const checkpoint = this.versionHistoryEngine.createCheckpoint('Initial Draft', 'Visual designer studio auto configuration.', project.screens);
    this.versionsCount++;
    studioMetrics.trackVersion();

    // 10. Design review and scoring
    const reviewResult = this.designReviewBoard.evaluateProject({
      usability: 95,
      consistency: 92,
      accessibility: 90,
      responsiveness: 88,
      branding: 94
    });
    this.reviewsCount++;
    studioMetrics.trackReview();

    // 11. Style tokens and comments reference checks
    const tokensCount = this.styleTokenManager.getTokens().length;
    const commentsCount = this.collaborationWorkspace.getComments().length;
    project.metadata['tokensCount'] = tokensCount;
    project.metadata['commentsCount'] = commentsCount;

    // 12. Exports planning
    const exportPlan = this.exportPlanner.planExport(project.targetFramework, project.screens);
    this.exportsCount++;
    studioMetrics.trackExport();

    const studioPackage: VisualStudioPackage = {
      project,
      viewport,
      layers,
      screensComposed,
      componentsList,
      layoutConstraints,
      assetCount: this.designAssetManager.getAllAssets().length,
      connections,
      responsiveViewports,
      reviewResult,
      exportPlan,
      version: checkpoint.revision.toString() + '.0.0'
    };

    this.activeProjects.set(projectId, studioPackage);
    return studioPackage;
  }

  public getDiagnostics() {
    return {
      designProjects: this.designProjects,
      screens: this.screensCount,
      components: this.componentsCount,
      layouts: this.layoutsCount,
      assets: this.assetsCount,
      prototypes: this.prototypesCount,
      versions: this.versionsCount,
      reviews: this.reviewsCount,
      exports: this.exportsCount
    };
  }

  public getActiveProject(id: string): VisualStudioPackage | undefined {
    return this.activeProjects.get(id);
  }

  public clear(): void {
    this.designProjects = 0;
    this.screensCount = 0;
    this.componentsCount = 0;
    this.layoutsCount = 0;
    this.assetsCount = 0;
    this.prototypesCount = 0;
    this.versionsCount = 0;
    this.reviewsCount = 0;
    this.exportsCount = 0;
    this.activeProjects.clear();
    studioMetrics.clear();
  }
}

export const visualDesignerStudio = new VisualDesignerStudio();
export default visualDesignerStudio;
