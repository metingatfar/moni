export class FirstLaunchExperience {
  public getSplashConfig() {
    return {
      logoUrl: '/assets/logo.png',
      fadeDurationMs: 800,
      revealScale: 1.0,
      loadingSteps: [
        'Bootstrapping containers...',
        'Resolving AI engine nodes...',
        'Spinning up Studio workspaces...'
      ]
    };
  }

  public getWelcomeGreeting(username: string): string {
    return `Good Morning ${username}. Welcome to MONI AI Operating System.`;
  }
}
export const firstLaunchExperience = new FirstLaunchExperience();
export default firstLaunchExperience;
