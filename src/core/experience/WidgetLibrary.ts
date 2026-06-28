export interface MoniWidgetMeta {
  id: string;
  title: string;
  category: 'project' | 'status' | 'analytics' | 'provider';
  tags: string[];
}

export class WidgetLibrary {
  private library: MoniWidgetMeta[] = [
    { id: 'widget-proj-card', title: 'Project Card', category: 'project', tags: ['name', 'technology', 'date'] },
    { id: 'widget-status-ring', title: 'Statistics Ring', category: 'status', tags: ['percentage', 'build'] },
    { id: 'widget-risk-meter', title: 'Risk Meter', category: 'analytics', tags: ['lockin', 'migration'] },
    { id: 'widget-provider-status', title: 'Provider Status', category: 'provider', tags: ['active', 'model'] }
  ];

  public getWidgets(category?: MoniWidgetMeta['category']): MoniWidgetMeta[] {
    if (category) {
      return this.library.filter(w => w.category === category);
    }
    return this.library;
  }
}
export const widgetLibrary = new WidgetLibrary();
export default widgetLibrary;
