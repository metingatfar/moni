import type { BuilderScreen } from './BuilderScreen';
import type { BuilderComponent } from './BuilderComponent';

export class AIVisualCommandEngine {
  private commandCount = 0;

  public parseCommand(command: string, screen: BuilderScreen): { success: boolean; changesApplied: string[] } {
    this.commandCount++;
    const changesApplied: string[] = [];
    const lower = command.toLowerCase();

    if (lower.includes('login button') || lower.includes('add button')) {
      const btn: BuilderComponent = {
        id: `btn_login_${Date.now()}`,
        type: 'Button',
        x: 100,
        y: 250,
        properties: {
          label: 'Sign In',
          boundTokens: { background: 'PrimaryColor', color: 'TextLight' }
        },
        constraints: { widthMode: 'fixed', heightMode: 'fixed', widthVal: 200, heightVal: 45, pinnedEdges: ['left', 'top'] },
        events: { onClick: 'onNavigate' },
        dataBinding: {}
      };
      screen.components.push(btn);
      changesApplied.push('Created btn_login and applied PrimaryColor token constraints.');
    }

    if (lower.includes('fitness dashboard') || lower.includes('fitness card')) {
      const fitCard: BuilderComponent = {
        id: `card_fitness_metrics`,
        type: 'FitnessCard',
        x: 20,
        y: 100,
        properties: {
          label: 'Daily Calories & Steps Progress',
          boundTokens: { background: 'BgCard', radius: 'RadiusLarge' }
        },
        constraints: { widthMode: 'fill', heightMode: 'fixed', heightVal: 180, pinnedEdges: ['left', 'right', 'top'] },
        events: {},
        dataBinding: { targetStateKey: 'caloriesTrack' }
      };
      screen.components.push(fitCard);
      changesApplied.push('Created fitness progress card with responsive width fill constraints.');
    }

    if (lower.includes('dark theme') || lower.includes('dark mode')) {
      screen.metadata.theme = 'dark';
      changesApplied.push('Switched screen metadata design mode to dark-theme tokens mapping.');
    }

    if (lower.includes('mobile friendly') || lower.includes('mobile')) {
      screen.viewport = { width: 390, height: 844 }; // iPhone size
      screen.layoutMode = 'flex';
      changesApplied.push('Resized viewport to 390x844 (mobile view) and configured layoutMode to flex.');
    }

    if (lower.includes('modern') || lower.includes('premium')) {
      screen.metadata.stylePreference = 'premium-flat-glassmorphism';
      changesApplied.push('Set design style token hierarchy to flat glassmorphism.');
    }

    return {
      success: changesApplied.length > 0,
      changesApplied
    };
  }

  public getParsedCount(): number {
    return this.commandCount;
  }
}
