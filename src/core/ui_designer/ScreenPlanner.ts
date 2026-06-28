import type { UIDesignRequest } from './UIDesignRequest';

export interface PlannedScreen {
  name: string;
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  primaryGoal: string;
  keyWidgets: string[];
  estimatedUserSeconds: number;
}

export class ScreenPlanner {
  public planScreens(request: UIDesignRequest): PlannedScreen[] {
    const screenName = request.screenType || 'Dashboard';
    const screens: PlannedScreen[] = [];

    // Main screen planning
    screens.push({
      name: screenName.charAt(0).toUpperCase() + screenName.slice(1),
      type: 'Primary View',
      priority: 'High',
      primaryGoal: `Satisfy requested design requirements for: ${screenName}`,
      keyWidgets: ['Header', 'Sidebar', 'MainGrid', 'ActionButtonContainer'],
      estimatedUserSeconds: 45
    });

    // Mobile Navigation screen if needed
    if (request.platform === 'mobile' || request.platform === 'foldable' || request.platform === 'responsive') {
      screens.push({
        name: 'Mobile Navigation Overlay',
        type: 'Overlay Panel',
        priority: 'High',
        primaryGoal: 'Provide quick route switches and context switching on small viewports.',
        keyWidgets: ['SearchInput', 'NavLinks', 'UserProfileSummary', 'ThemeToggle'],
        estimatedUserSeconds: 8
      });
    }

    // Default ancillary screen: Settings / Config Panel
    const name = screenName.charAt(0).toUpperCase() + screenName.slice(1);
    screens.push({
      name: `${name} Settings`,
      type: 'Sub-view / Modal',
      priority: 'Medium',
      primaryGoal: 'Configure parameters, preferences, and custom values.',
      keyWidgets: ['FormFields', 'SaveButton', 'CancelButton'],
      estimatedUserSeconds: 20
    });

    return screens;
  }
}
