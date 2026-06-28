export class MobilePlanner {
  public planMobile(userInput: string, framework: string): { enabled: boolean; platforms: string[]; framework: string } {
    const lower = userInput.toLowerCase();
    const enabled = lower.includes('mobile') || lower.includes('phone') || lower.includes('app') || lower.includes('ios') || lower.includes('android');

    const platforms = enabled ? ['iOS', 'Android'] : [];
    let fw = 'None';
    if (enabled) {
      if (framework.toLowerCase() === 'flutter') {
        fw = 'Flutter (Dart)';
      } else if (framework.toLowerCase() === 'react native' || framework.toLowerCase() === 'react') {
        fw = 'React Native (TypeScript)';
      } else {
        fw = 'Capacitor (Web Bridge)';
      }
    }

    return {
      enabled,
      platforms,
      framework: fw
    };
  }
}
