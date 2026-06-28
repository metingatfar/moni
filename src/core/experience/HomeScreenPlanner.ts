export class HomeScreenPlanner {
  public planHomeScreen(user: string) {
    return {
      title: `Good Morning ${user}`,
      subtitle: 'Continue your MONI Project',
      sections: [
        { id: 'sec-recent-activities', label: 'Recent Activities', visible: true },
        { id: 'sec-ai-suggestions', label: 'AI Suggestions', visible: true },
        { id: 'sec-sprint-overview', label: 'Current Sprint', visible: true },
        { id: 'sec-provider-status', label: 'Provider Status', visible: true }
      ]
    };
  }
}
export const homeScreenPlanner = new HomeScreenPlanner();
export default homeScreenPlanner;
