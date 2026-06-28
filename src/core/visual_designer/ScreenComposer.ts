export interface ComposedScreen {
  id: string;
  name: string;
  templateType: string;
  widgetsList: string[];
  dimensions: { width: number; height: number };
}

export class ScreenComposer {
  public composeScreen(name: string, templateType: string): ComposedScreen {
    const widgetsList = ['Header', 'Navigation', 'MainGrid'];
    
    if (templateType.toLowerCase().includes('dashboard')) {
      widgetsList.push('SummaryCards', 'AnalyticsChart', 'RecentActivities');
    } else if (templateType.toLowerCase().includes('login')) {
      widgetsList.push('UsernameInput', 'PasswordInput', 'SubmitButton', 'ForgotPasswordLink');
    } else if (templateType.toLowerCase().includes('settings')) {
      widgetsList.push('ProfileForm', 'NotificationToggles', 'ThemeSelector');
    } else if (templateType.toLowerCase().includes('chat')) {
      widgetsList.push('MessageHistory', 'InputField', 'SendButton', 'VoiceInputButton');
    }

    return {
      id: `screen-${Date.now()}`,
      name,
      templateType,
      widgetsList,
      dimensions: { width: 1440, height: 900 }
    };
  }
}
