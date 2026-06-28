import { UXAnalyzer } from './UXAnalyzer';
import { ScreenPlanner } from './ScreenPlanner';
import { LayoutEngine } from './LayoutEngine';
import { ComponentLibrary } from './ComponentLibrary';
import { ThemeEngine } from './ThemeEngine';
import { ColorHarmonyEngine } from './ColorHarmonyEngine';
import { TypographyEngine } from './TypographyEngine';
import { ResponsiveEngine } from './ResponsiveEngine';
import { AccessibilityEngine } from './AccessibilityEngine';
import { InteractionDesigner } from './InteractionDesigner';
import { DesignReviewEngine } from './DesignReviewEngine';
import { DesignScoreEngine } from './DesignScoreEngine';
import { DesignSystemManager } from './DesignSystemManager';
import { WireframeGenerator } from './WireframeGenerator';
import type { UIDesignRequest } from './UIDesignRequest';

export interface UIApprovalPackage {
  requestId: string;
  request: UIDesignRequest;
  uxAnalysis: any;
  screens: any[];
  layout: any;
  components: any[];
  theme: any;
  colorPalette: any;
  typography: any;
  responsiveBreakpoint: any;
  accessibilityRules: any[];
  interactions: any;
  review: any;
  scores: any;
  designSystem: any;
  wireframes: any[];
}

export class UIDesignerAgent {
  private uxAnalyzer = new UXAnalyzer();
  private screenPlanner = new ScreenPlanner();
  private layoutEngine = new LayoutEngine();
  private componentLibrary = new ComponentLibrary();
  private themeEngine = new ThemeEngine();
  private colorHarmonyEngine = new ColorHarmonyEngine();
  private typographyEngine = new TypographyEngine();
  private responsiveEngine = new ResponsiveEngine();
  private accessibilityEngine = new AccessibilityEngine();
  private interactionDesigner = new InteractionDesigner();
  private designReviewEngine = new DesignReviewEngine();
  private designScoreEngine = new DesignScoreEngine();
  private designSystemManager = new DesignSystemManager();
  private wireframeGenerator = new WireframeGenerator();

  // Diagnostics counters
  private designSessions = 0;
  private screensDesigned = 0;
  private wireframesGenerated = 0;
  private componentsUsed = 0;
  private themesGenerated = 0;
  private lastUxScore = 0;
  private lastUiScore = 0;
  private lastAccessibilityScore = 0;

  private activePackages: Map<string, UIApprovalPackage> = new Map();

  public designApplication(userInput: string): UIApprovalPackage {
    this.designSessions++;
    const requestId = `ui-req-${Date.now()}`;
    const lower = userInput.toLowerCase();

    // Determine platform
    let platform: UIDesignRequest['platform'] = 'desktop';
    if (lower.includes('mobile') || lower.includes('phone') || lower.includes('ios') || lower.includes('android')) {
      platform = 'mobile';
    } else if (lower.includes('tablet')) {
      platform = 'tablet';
    } else if (lower.includes('responsive')) {
      platform = 'responsive';
    } else if (lower.includes('foldable')) {
      platform = 'foldable';
    }

    // Determine style Mode
    let styleMode: UIDesignRequest['branding']['styleMode'] = 'flat';
    if (lower.includes('glass') || lower.includes('glassmorphism')) {
      styleMode = 'glassmorphism';
    } else if (lower.includes('neo') || lower.includes('brutalism')) {
      styleMode = 'neo-brutalism';
    } else if (lower.includes('minimal') || lower.includes('minimalist')) {
      styleMode = 'minimalist';
    } else if (lower.includes('skeuo') || lower.includes('skeuomorphic')) {
      styleMode = 'skeuomorphic';
    }

    // Determine screen type
    let screenType = 'dashboard';
    if (lower.includes('login')) screenType = 'login';
    else if (lower.includes('settings')) screenType = 'settings';
    else if (lower.includes('profile')) screenType = 'profile';
    else if (lower.includes('report')) screenType = 'reports';
    else if (lower.includes('admin')) screenType = 'admin panel';
    else if (lower.includes('chat')) screenType = 'ai chat';
    else if (lower.includes('analytics')) screenType = 'analytics';
    else if (lower.includes('calendar')) screenType = 'calendar';
    else if (lower.includes('fitness')) screenType = 'fitness app';

    const request: UIDesignRequest = {
      id: requestId,
      screenType,
      platform,
      targetUsers: ['General Users', 'Corporate Customers'],
      branding: {
        primaryColor: lower.includes('fitness') ? '#f97316' : (lower.includes('medical') ? '#06b6d4' : '#6366f1'),
        styleMode,
      },
      accessibilityLevel: 'AA',
      deviceTargets: platform === 'mobile' ? ['iPhone 15 Pro', 'Pixel 8'] : ['Standard Desktop Viewport'],
      designConstraints: ['Strict Contrast compliance', 'Compact margins', 'Fluid Flex Grid layout'],
      timestamp: new Date().toISOString()
    };

    // 1. UX Analysis
    const uxAnalysis = this.uxAnalyzer.analyzeRequest(request);

    // 2. Screen Planning
    const screens = this.screenPlanner.planScreens(request);
    this.screensDesigned += screens.length;

    // 3. Layout planning
    const layout = this.layoutEngine.generateLayout(request.platform);

    // 4. Component resolution
    const components = this.componentLibrary.resolveComponents(['Shadcn/UI', 'Material Design']);
    this.componentsUsed += components.length;

    // 5. Theme Generation
    const theme = this.themeEngine.generateTheme(screenType + ' theme', 'dark');
    this.themesGenerated++;

    // 6. Color Harmony Engine
    const colorPalette = this.colorHarmonyEngine.calculateHarmony(
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.background,
      theme.colors.surface
    );

    // 7. Typography Engine
    const typography = this.typographyEngine.planTypography(request.branding.styleMode);

    // 8. Responsive viewport resolution
    const responsiveBreakpoint = this.responsiveEngine.getAdaptiveLayout(platform === 'mobile' ? 390 : 1440);

    // 9. Accessibility audits
    const accessibilityRules = this.accessibilityEngine.auditAccessibility(request.accessibilityLevel);

    // 10. Interaction planning
    const interactions = this.interactionDesigner.planInteractions();

    // 11. Design Review
    const review = this.designReviewEngine.reviewDesign(request);

    // 12. Scoring Engine
    const scores = this.designScoreEngine.calculateScores(
      request.accessibilityLevel,
      request.platform,
      request.designConstraints.length
    );

    this.lastUxScore = scores.uxScore;
    this.lastUiScore = scores.uiScore;
    this.lastAccessibilityScore = scores.accessibilityScore;

    // 13. Design system details
    const designSystem = this.designSystemManager.getDesignSystem('Moni Premium');

    // 14. Wireframe Generation
    const wireframes = this.wireframeGenerator.generateWireframes(screens[0].name, request.platform);
    this.wireframesGenerated += wireframes.length;

    // 15. Create Approval Package
    const approvalPackage: UIApprovalPackage = {
      requestId,
      request,
      uxAnalysis,
      screens,
      layout,
      components,
      theme,
      colorPalette,
      typography,
      responsiveBreakpoint,
      accessibilityRules,
      interactions,
      review,
      scores,
      designSystem,
      wireframes
    };

    this.activePackages.set(requestId, approvalPackage);
    return approvalPackage;
  }

  public getDiagnostics() {
    return {
      designSessions: this.designSessions,
      screensDesigned: this.screensDesigned,
      wireframesGenerated: this.wireframesGenerated,
      componentsUsed: this.componentsUsed,
      themesGenerated: this.themesGenerated,
      uxScore: this.lastUxScore || 85,
      uiScore: this.lastUiScore || 88,
      accessibilityScore: this.lastAccessibilityScore || 90
    };
  }

  public getPackage(requestId: string): UIApprovalPackage | undefined {
    return this.activePackages.get(requestId);
  }

  public clear(): void {
    this.designSessions = 0;
    this.screensDesigned = 0;
    this.wireframesGenerated = 0;
    this.componentsUsed = 0;
    this.themesGenerated = 0;
    this.lastUxScore = 0;
    this.lastUiScore = 0;
    this.lastAccessibilityScore = 0;
    this.activePackages.clear();
  }
}

export const uiDesignerAgent = new UIDesignerAgent();
export default uiDesignerAgent;
