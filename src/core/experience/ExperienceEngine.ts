import { FirstLaunchExperience } from './FirstLaunchExperience';
import { WorkspaceExperience } from './WorkspaceExperience';
import { NavigationDesigner } from './NavigationDesigner';
import { DashboardComposer } from './DashboardComposer';
import { HomeScreenPlanner } from './HomeScreenPlanner';
import { WorkspaceLayouts } from './WorkspaceLayouts';
import { ThemeEvolutionEngine } from './ThemeEvolutionEngine';
import { MotionDesignEngine } from './MotionDesignEngine';
import { WidgetLibrary } from './WidgetLibrary';
import { NotificationCenter } from './NotificationCenter';
import { CommandPalette } from './CommandPalette';
import { UserJourneyAnalyzer } from './UserJourneyAnalyzer';
import { ExperienceMetrics } from './ExperienceMetrics';

export class ExperienceEngine {
  private firstLaunch = new FirstLaunchExperience();
  private workspace = new WorkspaceExperience();
  private navigation = new NavigationDesigner();
  private composer = new DashboardComposer();
  private planner = new HomeScreenPlanner();
  private layouts = new WorkspaceLayouts();
  private themes = new ThemeEvolutionEngine();
  private motions = new MotionDesignEngine();
  private widgets = new WidgetLibrary();
  private notifications = new NotificationCenter();
  private commandPalette = new CommandPalette();
  private userJourney = new UserJourneyAnalyzer();
  private metrics = new ExperienceMetrics();

  public getFirstLaunch() { return this.firstLaunch; }
  public getWorkspace() { return this.workspace; }
  public getNavigation() { return this.navigation; }
  public getComposer() { return this.composer; }
  public getPlanner() { return this.planner; }
  public getLayouts() { return this.layouts; }
  public getThemes() { return this.themes; }
  public getMotions() { return this.motions; }
  public getWidgets() { return this.widgets; }
  public getNotifications() { return this.notifications; }
  public getCommandPalette() { return this.commandPalette; }
  public getUserJourney() { return this.userJourney; }
  public getMetrics() { return this.metrics; }
}

export const experienceEngine = new ExperienceEngine();
export default experienceEngine;
