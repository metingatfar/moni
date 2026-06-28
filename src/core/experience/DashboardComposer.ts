export interface DashboardWidgetConfig {
  id: string;
  type: 'recent_projects' | 'status_gauge' | 'recommendations' | 'system_health';
  widthSpan: number; // 1 to 3
}

export class DashboardComposer {
  public getDashboardLayout(): DashboardWidgetConfig[] {
    return [
      { id: 'widget-welcome', type: 'status_gauge', widthSpan: 3 },
      { id: 'widget-recent', type: 'recent_projects', widthSpan: 2 },
      { id: 'widget-health', type: 'system_health', widthSpan: 1 },
      { id: 'widget-ai', type: 'recommendations', widthSpan: 3 }
    ];
  }
}
export const dashboardComposer = new DashboardComposer();
export default dashboardComposer;
